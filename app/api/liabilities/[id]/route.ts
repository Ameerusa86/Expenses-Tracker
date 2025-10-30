import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import { Liability } from '@/models/Liability'
import { liabilityUpdateSchema } from '@/schemas/liability'
import { Types } from 'mongoose'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await dbConnect()
  const userId = await getUserId()
  const { id } = await params
  const _id = new Types.ObjectId(id)
  const item = await Liability.findOne({ _id, userId }).lean()
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
  const parsed = liabilityUpdateSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const item = await Liability.findOneAndUpdate(
    { _id, userId },
    { $set: parsed.data },
    { new: true },
  )
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ item })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await dbConnect()
  const userId = await getUserId()
  const { id } = await params
  const _id = new Types.ObjectId(id)
  const del = await Liability.deleteOne({ _id, userId })
  return NextResponse.json({ ok: del.deletedCount === 1 })
}
