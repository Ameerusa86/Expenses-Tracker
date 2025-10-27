import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { Account } from '@/models/Account'
import { accountUpdateSchema } from '@/schemas/account'
import { getUserId } from '@/lib/auth'
import { Types } from 'mongoose'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await dbConnect()
  const userId = await getUserId()
  const { id } = await params
  const _id = new Types.ObjectId(id)
  const item = await Account.findOne({ _id, userId }).lean()
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ item })
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await dbConnect()
  const userId = await getUserId()
  const { id } = await params
  const _id = new Types.ObjectId(id)
  const body = await req.json()
  const parsed = accountUpdateSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const item = await Account.findOneAndUpdate(
    { _id, userId },
    { $set: parsed.data },
    { new: true },
  )
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ item })
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await dbConnect()
  const userId = await getUserId()
  const { id } = await params
  const _id = new Types.ObjectId(id)
  const del = await Account.deleteOne({ _id, userId })
  return NextResponse.json({ ok: del.deletedCount === 1 })
}
