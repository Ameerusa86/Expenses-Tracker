'use server'
import { dbConnect } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import { RecurringIncome } from '@/models/RecurringIncome'
import {
  recurringIncomeCreateSchema,
  recurringIncomeUpdateSchema,
} from '@/schemas/recurring-income'

export async function createRecurringIncome(input: unknown) {
  await dbConnect()
  const userId = await getUserId()
  const parsed = recurringIncomeCreateSchema.parse(input)

  const doc = await RecurringIncome.create({ ...parsed, userId })
  return JSON.parse(JSON.stringify(doc))
}

export async function updateRecurringIncome(id: string, input: unknown) {
  await dbConnect()
  const userId = await getUserId()
  const parsed = recurringIncomeUpdateSchema.parse(input)

  const updated = await RecurringIncome.findOneAndUpdate(
    { _id: id, userId },
    { $set: parsed },
    { new: true },
  )
  if (!updated) throw new Error('Recurring income not found')
  return JSON.parse(JSON.stringify(updated))
}

export async function listRecurringIncome() {
  await dbConnect()
  const userId = await getUserId()
  const rows = await RecurringIncome.find({ userId }).sort({ startDate: 1 })
  return JSON.parse(JSON.stringify(rows))
}
