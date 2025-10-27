import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { Transaction } from '@/models/Transaction'
import { transactionCreateSchema } from '@/schemas/transaction'
import { getUserId } from '@/lib/auth'

export async function GET(req: Request) {
  await dbConnect()
  const userId = await getUserId()
  const { searchParams } = new URL(req.url)
  const accountId = searchParams.get('accountId')
  const limit = Number(searchParams.get('limit') || 50)
  const page = Number(searchParams.get('page') || 1)
  const query: any = { userId }
  if (accountId) query.accountId = accountId

  const items = await Transaction.find(query)
    .sort({ date: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

  const total = await Transaction.countDocuments(query)
  return NextResponse.json({ items, total, page, limit })
}

export async function POST(req: Request) {
  await dbConnect()
  const userId = await getUserId()
  const body = await req.json()
  const parsed = transactionCreateSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const session = await (await import('mongoose')).default.startSession()
  try {
    session.startTransaction()
    const doc = await Transaction.create([{ ...parsed.data, userId }], {
      session,
    })
    await session.commitTransaction()
    return NextResponse.json({ item: doc[0] }, { status: 201 })
  } catch (e) {
    await session.abortTransaction()
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  } finally {
    session.endSession()
  }
}
