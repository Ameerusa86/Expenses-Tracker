'use server'
import { dbConnect } from '@/lib/db'
import { Category } from '@/models/Category'
import { categoryCreateSchema, categoryUpdateSchema } from '@/schemas/category'
import { getUserId } from '@/lib/auth'

export async function createCategory(input: unknown) {
  await dbConnect()
  const userId = await getUserId()
  const parsed = categoryCreateSchema.parse(input)
  const doc = await Category.create({ ...parsed, userId })
  return JSON.parse(JSON.stringify(doc))
}

export async function updateCategory(id: string, input: unknown) {
  await dbConnect()
  const userId = await getUserId()
  const parsed = categoryUpdateSchema.parse(input)
  const doc = await Category.findOneAndUpdate(
    { _id: id, userId },
    { $set: parsed },
    { new: true },
  )
  if (!doc) throw new Error('Category not found')
  return JSON.parse(JSON.stringify(doc))
}

export async function deleteCategory(id: string) {
  await dbConnect()
  const userId = await getUserId()
  await Category.deleteOne({ _id: id, userId })
  return { ok: true }
}
