'use server'
import mongoose from 'mongoose'
import { dbConnect } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import { Liability } from '@/models/Liability'
import { LiabilityCharge } from '@/models/LiabilityCharge'
import {
  liabilityChargeCreateSchema,
  liabilityChargeUpdateSchema,
} from '@/schemas/liability-charge'

export async function createLiabilityCharge(input: unknown) {
  await dbConnect()
  const userId = await getUserId()
  const parsed = liabilityChargeCreateSchema.parse(input)

  const session = await mongoose.startSession()
  try {
    session.startTransaction()
    const liability = await Liability.findOne({
      _id: parsed.liabilityId,
      userId,
    }).session(session)
    if (!liability) throw new Error('Liability not found')

    const [charge] = await LiabilityCharge.create(
      [
        {
          ...parsed,
          userId,
        },
      ],
      { session },
    )

    // Increase balance by charge amount
    liability.balanceCents = (liability.balanceCents || 0) + parsed.amountCents
    await liability.save({ session })

    await session.commitTransaction()
    return JSON.parse(JSON.stringify(charge))
  } catch (e) {
    await session.abortTransaction()
    throw e
  } finally {
    session.endSession()
  }
}

export async function updateLiabilityCharge(id: string, input: unknown) {
  await dbConnect()
  const userId = await getUserId()
  const parsed = liabilityChargeUpdateSchema.parse(input)

  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    const existing = await LiabilityCharge.findOne({
      _id: id,
      userId,
    }).session(session)
    if (!existing) throw new Error('Charge not found')

    if (
      parsed.amountCents !== undefined &&
      parsed.amountCents !== existing.amountCents
    ) {
      const diff = parsed.amountCents - existing.amountCents // positive means more charge
      const liability = await Liability.findOne({
        _id: existing.liabilityId,
        userId,
      }).session(session)
      if (!liability) throw new Error('Liability not found')
      liability.balanceCents = (liability.balanceCents || 0) + diff
      await liability.save({ session })
    }

    const updated = await LiabilityCharge.findOneAndUpdate(
      { _id: id, userId },
      { $set: parsed },
      { new: true, session },
    )
    if (!updated) throw new Error('Charge not found')

    await session.commitTransaction()
    return JSON.parse(JSON.stringify(updated))
  } catch (e) {
    await session.abortTransaction()
    throw e
  } finally {
    session.endSession()
  }
}

export async function deleteLiabilityCharge(id: string) {
  await dbConnect()
  const userId = await getUserId()

  const session = await mongoose.startSession()
  try {
    session.startTransaction()
    const existing = await LiabilityCharge.findOne({
      _id: id,
      userId,
    }).session(session)
    if (!existing) {
      await session.commitTransaction()
      return { ok: true }
    }

    const liability = await Liability.findOne({
      _id: existing.liabilityId,
      userId,
    }).session(session)
    if (liability) {
      // Reverse the charge by decreasing balance
      liability.balanceCents = Math.max(
        0,
        (liability.balanceCents || 0) - existing.amountCents,
      )
      await liability.save({ session })
    }

    await LiabilityCharge.deleteOne({ _id: id, userId }, { session })
    await session.commitTransaction()
    return { ok: true }
  } catch (e) {
    await session.abortTransaction()
    throw e
  } finally {
    session.endSession()
  }
}
