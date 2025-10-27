'use server'
import mongoose from 'mongoose'
import { dbConnect } from '@/lib/db'
import { Transaction } from '@/models/Transaction'
import {
  transactionCreateSchema,
  transactionUpdateSchema,
} from '@/schemas/transaction'
import { getUserId } from '@/lib/auth'

export async function createTransaction(input: unknown) {
  await dbConnect()
  const userId = await getUserId()
  const parsed = transactionCreateSchema.parse(input)
  const session = await mongoose.startSession()
  try {
    session.startTransaction()
    const doc = await Transaction.create([{ ...parsed, userId }], { session })
    await session.commitTransaction()
    return JSON.parse(JSON.stringify(doc[0]))
  } catch (e) {
    await session.abortTransaction()
    throw e
  } finally {
    session.endSession()
  }
}

export async function updateTransaction(id: string, input: unknown) {
  await dbConnect()
  const userId = await getUserId()
  const parsed = transactionUpdateSchema.parse(input)
  const session = await mongoose.startSession()
  try {
    session.startTransaction()
    const doc = await Transaction.findOneAndUpdate(
      { _id: id, userId },
      { $set: parsed },
      { new: true, session },
    )
    if (!doc) throw new Error('Transaction not found')
    await session.commitTransaction()
    return JSON.parse(JSON.stringify(doc))
  } catch (e) {
    await session.abortTransaction()
    throw e
  } finally {
    session.endSession()
  }
}

export async function deleteTransaction(id: string) {
  await dbConnect()
  const userId = await getUserId()
  const session = await mongoose.startSession()
  try {
    session.startTransaction()
    await Transaction.deleteOne({ _id: id, userId }, { session })
    await session.commitTransaction()
    return { ok: true }
  } catch (e) {
    await session.abortTransaction()
    throw e
  } finally {
    session.endSession()
  }
}
