import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { Account } from '@/models/Account'
import { accountCreateSchema } from '@/schemas/account'
import { getUserId } from '@/lib/auth'

export async function GET() {
  await dbConnect()
  const userId = await getUserId()
  const items = await Account.find({ userId }).sort({ createdAt: -1 }).lean()
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  await dbConnect()
  const userId = await getUserId()
  const body = await req.json()
  const parsed = accountCreateSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const doc = await Account.create({ ...parsed.data, userId })
  return NextResponse.json({ item: doc }, { status: 201 })
}
