'use server'
import { dbConnect } from '@/lib/db'
import { Account } from '@/models/Account'
import { accountCreateSchema, accountUpdateSchema } from '@/schemas/account'
import { getUserId } from '@/lib/auth'

export async function createAccount(input: unknown) {
  await dbConnect()
  const userId = await getUserId()
  const parsed = accountCreateSchema.parse(input)
  const doc = await Account.create({ ...parsed, userId })
  return JSON.parse(JSON.stringify(doc))
}

export async function updateAccount(id: string, input: unknown) {
  await dbConnect()
  const userId = await getUserId()
  const parsed = accountUpdateSchema.parse(input)
  const doc = await Account.findOneAndUpdate(
    { _id: id, userId },
    { $set: parsed },
    { new: true },
  )
  if (!doc) throw new Error('Account not found')
  return JSON.parse(JSON.stringify(doc))
}

export async function deleteAccount(id: string) {
  await dbConnect()
  const userId = await getUserId()
  await Account.deleteOne({ _id: id, userId })
  return { ok: true }
}
