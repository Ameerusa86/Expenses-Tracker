import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { Category } from '@/models/Category'
import { categoryUpdateSchema } from '@/schemas/category'
import { getUserId } from '@/lib/auth'
import { Types } from 'mongoose'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await dbConnect()
  const userId = await getUserId()
  const _id = new Types.ObjectId(params.id)
  const item = await Category.findOne({ _id, userId }).lean()
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ item })
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  await dbConnect()
  const userId = await getUserId()
  const _id = new Types.ObjectId(params.id)
  const body = await req.json()
  const parsed = categoryUpdateSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const item = await Category.findOneAndUpdate(
    { _id, userId },
    { $set: parsed.data },
    { new: true },
  )
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ item })
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  await dbConnect()
  const userId = await getUserId()
  const _id = new Types.ObjectId(params.id)
  const del = await Category.deleteOne({ _id, userId })
  return NextResponse.json({ ok: del.deletedCount === 1 })
}
