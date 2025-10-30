'use server'
import mongoose from 'mongoose'
import { dbConnect } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import { Liability } from '@/models/Liability'
import { LiabilityPayment } from '@/models/LiabilityPayment'
import {
  liabilityPaymentCreateSchema,
  liabilityPaymentUpdateSchema,
} from '@/schemas/liability-payment'

export async function createLiabilityPayment(input: unknown) {
  await dbConnect()
  const userId = await getUserId()
  const parsed = liabilityPaymentCreateSchema.parse(input)

  const session = await mongoose.startSession()
  try {
    session.startTransaction()
    // Ensure liability belongs to user
    const liability = await Liability.findOne({
      _id: parsed.liabilityId,
      userId,
    }).session(session)
    if (!liability) throw new Error('Liability not found')

    const [payment] = await LiabilityPayment.create(
      [
        {
          ...parsed,
          userId,
        },
      ],
      { session },
    )

    // Reduce balance by payment amount
    liability.balanceCents = Math.max(
      0,
      (liability.balanceCents || 0) - parsed.amountCents,
    )
    liability.lastPaymentDate = parsed.date
    await liability.save({ session })

    await session.commitTransaction()
    return JSON.parse(JSON.stringify(payment))
  } catch (e) {
    await session.abortTransaction()
    throw e
  } finally {
    session.endSession()
  }
}

export async function updateLiabilityPayment(id: string, input: unknown) {
  await dbConnect()
  const userId = await getUserId()
  const parsed = liabilityPaymentUpdateSchema.parse(input)

  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    const existing = await LiabilityPayment.findOne({
      _id: id,
      userId,
    }).session(session)
    if (!existing) throw new Error('Payment not found')

    // Adjust liability balance if amount changed
    if (
      parsed.amountCents !== undefined &&
      parsed.amountCents !== existing.amountCents
    ) {
      const diff = parsed.amountCents - existing.amountCents // positive means increase payment
      const liability = await Liability.findOne({
        _id: existing.liabilityId,
        userId,
      }).session(session)
      if (!liability) throw new Error('Liability not found')
      liability.balanceCents = Math.max(0, (liability.balanceCents || 0) - diff)
      await liability.save({ session })
    }

    const updated = await LiabilityPayment.findOneAndUpdate(
      { _id: id, userId },
      { $set: parsed },
      { new: true, session },
    )
    if (!updated) throw new Error('Payment not found')

    await session.commitTransaction()
    return JSON.parse(JSON.stringify(updated))
  } catch (e) {
    await session.abortTransaction()
    throw e
  } finally {
    session.endSession()
  }
}

export async function deleteLiabilityPayment(id: string) {
  await dbConnect()
  const userId = await getUserId()

  const session = await mongoose.startSession()
  try {
    session.startTransaction()
    const existing = await LiabilityPayment.findOne({
      _id: id,
      userId,
    }).session(session)
    if (!existing) {
      await session.commitTransaction()
      return { ok: true }
    }

    // Reverse the balance reduction by adding back the payment amount
    const liability = await Liability.findOne({
      _id: existing.liabilityId,
      userId,
    }).session(session)
    if (liability) {
      liability.balanceCents =
        (liability.balanceCents || 0) + existing.amountCents
      await liability.save({ session })
    }

    await LiabilityPayment.deleteOne({ _id: id, userId }, { session })
    await session.commitTransaction()
    return { ok: true }
  } catch (e) {
    await session.abortTransaction()
    throw e
  } finally {
    session.endSession()
  }
}
