import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { Category } from '@/models/Category'
import { categoryCreateSchema } from '@/schemas/category'
import { getUserId } from '@/lib/auth'

export async function GET() {
  await dbConnect()
  const userId = await getUserId()
  const items = await Category.find({ userId }).sort({ name: 1 }).lean()
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  await dbConnect()
  const userId = await getUserId()
  const body = await req.json()
  const parsed = categoryCreateSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const item = await Category.create({ ...parsed.data, userId })
  return NextResponse.json({ item }, { status: 201 })
}
