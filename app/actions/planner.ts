'use server'
import mongoose, { Types } from 'mongoose'
import { dbConnect } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import { generateAllocations } from '@/lib/planner'
import { generatePlanSchema, applyPlanSchema } from '@/schemas/planner'
import { PaymentPlan } from '@/models/PaymentPlan'
import { LiabilityPayment } from '@/models/LiabilityPayment'
import { Liability } from '@/models/Liability'

export async function generatePlan(input: unknown) {
  await dbConnect()
  const userId = await getUserId()
  const parsed = generatePlanSchema.parse(input)

  const result = await generateAllocations({
    paycheckAmountCents: parsed.paycheckAmountCents,
    payDate: parsed.payDate,
    reserveCents: parsed.reserveCents,
    strategy: parsed.strategy,
    userId,
    targetUtilizationPercent: parsed.targetUtilizationPercent,
  })

  // Persist as draft plan for traceability
  const plan = await PaymentPlan.create({
    userId: userId as unknown as Types.ObjectId,
    strategy: parsed.strategy,
    paycheckAmountCents: parsed.paycheckAmountCents,
    payDate: parsed.payDate,
    reserveCents: parsed.reserveCents,
    allocations: result.allocations.map((a) => ({
      liabilityId: a.liabilityId,
      amountCents: a.amountCents,
      dueDate: a.dueDate,
    })),
    status: 'draft',
  })

  // Enrich allocations with liability names for UI display
  const ids = result.allocations.map((a) => a.liabilityId)
  const liabs = ids.length
    ? await Liability.find({ _id: { $in: ids }, userId }, { _id: 1, name: 1 })
        .lean()
        .exec()
    : []
  const nameById = new Map<string, string>(
    liabs.map((l) => [String(l._id), l.name as unknown as string]),
  )

  const enriched = {
    allocations: result.allocations.map((a) => ({
      liabilityId: String(a.liabilityId),
      liabilityName: nameById.get(String(a.liabilityId)),
      amountCents: a.amountCents,
      dueDate: a.dueDate,
    })),
    totalAllocatedCents: result.totalAllocatedCents,
    remainingCents: result.remainingCents,
  }

  return JSON.parse(
    JSON.stringify({ planId: plan._id, ...enriched, payDate: parsed.payDate }),
  )
}

export async function applyPlan(planId: string) {
  await dbConnect()
  const userId = await getUserId()

  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    const plan = await PaymentPlan.findOne({ _id: planId, userId }).session(
      session,
    )
    if (!plan) throw new Error('Plan not found')
    if (!plan.allocations?.length) throw new Error('No allocations to apply')

    // Create liability payments dated at plan.payDate
    const created = await LiabilityPayment.create(
      (
        plan.allocations as {
          liabilityId: Types.ObjectId
          amountCents: number
        }[]
      ).map((a) => ({
        userId,
        liabilityId: a.liabilityId,
        amountCents: a.amountCents,
        date: plan.payDate,
        notes: `Planner (${plan.strategy})`,
      })),
      { session },
    )

    // Update liability balances and last payment dates
    const totals = new Map<string, number>()
    for (const a of plan.allocations) {
      const key = String(a.liabilityId)
      totals.set(key, (totals.get(key) || 0) + a.amountCents)
    }
    for (const [lid, amt] of totals.entries()) {
      const liability = await Liability.findOne({
        _id: lid,
        userId: userId as unknown as Types.ObjectId,
      }).session(session)
      if (liability) {
        liability.balanceCents = Math.max(
          0,
          (liability.balanceCents || 0) - amt,
        )
        liability.lastPaymentDate = plan.payDate
        await liability.save({ session })
      }
    }

    // Mark plan as applied
    plan.status = 'applied'
    await plan.save({ session })

    await session.commitTransaction()
    return JSON.parse(
      JSON.stringify({ ok: true, created: created.map((p) => p._id) }),
    )
  } catch (e) {
    await session.abortTransaction()
    throw e
  } finally {
    session.endSession()
  }
}
