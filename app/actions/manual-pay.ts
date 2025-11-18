'use server'
import mongoose, { Types } from 'mongoose'
import { dbConnect } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import { Liability } from '@/models/Liability'
import { LiabilityPayment } from '@/models/LiabilityPayment'
import { z } from 'zod'

const manualPaySchema = z.object({
  date: z.coerce.date(),
  notes: z.string().optional().default('Manual payment'),
  items: z
    .array(
      z.object({
        liabilityId: z.string().min(1),
        amountCents: z.number().int().positive(),
      }),
    )
    .min(1),
})

export async function manualPay(input: unknown) {
  await dbConnect()
  const userId = await getUserId()
  const parsed = manualPaySchema.parse(input)

  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    // Validate liabilities and build batch
    const ids = parsed.items.map((i) => new Types.ObjectId(i.liabilityId))
    const liabs = await Liability.find({ _id: { $in: ids }, userId })
      .session(session)
      .select({ _id: 1 })
      .lean()
    const allowed = new Set(liabs.map((l) => String(l._id)))
    for (const i of parsed.items) {
      if (!allowed.has(i.liabilityId)) throw new Error('Invalid liability')
    }

    const docs = parsed.items.map((i) => ({
      userId,
      liabilityId: i.liabilityId as unknown as Types.ObjectId,
      amountCents: i.amountCents,
      date: parsed.date,
      notes: parsed.notes,
    }))

    const created = await LiabilityPayment.create(docs, { session })

    // Update balances in aggregate
    const totals = new Map<string, number>()
    for (const i of parsed.items) {
      totals.set(
        i.liabilityId,
        (totals.get(i.liabilityId) || 0) + i.amountCents,
      )
    }
    for (const [lid, amt] of totals) {
      const liability = await Liability.findOne({ _id: lid, userId }).session(
        session,
      )
      if (liability) {
        liability.balanceCents = Math.max(
          0,
          (liability.balanceCents || 0) - amt,
        )
        liability.lastPaymentDate = parsed.date
        await liability.save({ session })
      }
    }

    await session.commitTransaction()
    return JSON.parse(
      JSON.stringify({ ok: true, created: created.map((d) => d._id) }),
    )
  } catch (e) {
    await session.abortTransaction()
    throw e
  } finally {
    session.endSession()
  }
}
