import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import { LiabilityPayment } from '@/models/LiabilityPayment'
import { liabilityPaymentCreateSchema } from '@/schemas/liability-payment'

export async function GET(req: Request) {
  await dbConnect()
  const userId = await getUserId()
  const { searchParams } = new URL(req.url)
  const liabilityId = searchParams.get('liabilityId')
  const page = Number(searchParams.get('page') || '1')
  const limit = Math.min(Number(searchParams.get('limit') || '20'), 100)
  const skip = (Math.max(page, 1) - 1) * limit

  const query: Record<string, unknown> = { userId }
  if (liabilityId) query.liabilityId = liabilityId

  const [items, total] = await Promise.all([
    LiabilityPayment.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    LiabilityPayment.countDocuments(query),
  ])

  return NextResponse.json({
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
}

export async function POST(req: Request) {
  await dbConnect()
  const userId = await getUserId()
  const body = await req.json()
  const parsed = liabilityPaymentCreateSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const doc = await LiabilityPayment.create({ ...parsed.data, userId })
  return NextResponse.json({ item: doc }, { status: 201 })
}
