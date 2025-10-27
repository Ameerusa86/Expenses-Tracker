import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { Transaction } from '@/models/Transaction'
import { transactionUpdateSchema } from '@/schemas/transaction'
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
  const item = await Transaction.findOne({ _id, userId }).lean()
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
  const parsed = transactionUpdateSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const session = await (await import('mongoose')).default.startSession()
  try {
    session.startTransaction()
    const item = await Transaction.findOneAndUpdate(
      { _id, userId },
      { $set: parsed.data },
      { new: true, session },
    )
    if (!item) {
      await session.abortTransaction()
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    await session.commitTransaction()
    return NextResponse.json({ item })
  } catch {
    await session.abortTransaction()
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  } finally {
    session.endSession()
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await dbConnect()
  const userId = await getUserId()
  const { id } = await params
  const _id = new Types.ObjectId(id)

  const session = await (await import('mongoose')).default.startSession()
  try {
    session.startTransaction()
    const del = await Transaction.deleteOne({ _id, userId }, { session })
    await session.commitTransaction()
    return NextResponse.json({ ok: del.deletedCount === 1 })
  } catch {
    await session.abortTransaction()
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  } finally {
    session.endSession()
  }
}
