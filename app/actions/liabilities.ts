'use server'
import mongoose from 'mongoose'
import { dbConnect } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import { Liability } from '@/models/Liability'
import {
  liabilityCreateSchema,
  liabilityUpdateSchema,
} from '@/schemas/liability'
import { LiabilityPayment } from '@/models/LiabilityPayment'

export async function createLiability(input: unknown) {
  await dbConnect()
  const userId = await getUserId()
  const parsed = liabilityCreateSchema.parse(input)
  const doc = await Liability.create({ ...parsed, userId })
  return JSON.parse(JSON.stringify(doc))
}

export async function updateLiability(id: string, input: unknown) {
  await dbConnect()
  const userId = await getUserId()
  const parsed = liabilityUpdateSchema.parse(input)
  const doc = await Liability.findOneAndUpdate(
    { _id: id, userId },
    { $set: parsed },
    { new: true },
  )
  if (!doc) throw new Error('Liability not found')
  return JSON.parse(JSON.stringify(doc))
}

export async function deleteLiability(id: string) {
  await dbConnect()
  const userId = await getUserId()
  const session = await mongoose.startSession()
  try {
    session.startTransaction()
    await LiabilityPayment.deleteMany({ liabilityId: id, userId }, { session })
    await Liability.deleteOne({ _id: id, userId }, { session })
    await session.commitTransaction()
    return { ok: true }
  } catch (e) {
    await session.abortTransaction()
    throw e
  } finally {
    session.endSession()
  }
}
