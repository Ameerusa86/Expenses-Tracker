import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import { Liability } from '@/models/Liability'
import { liabilityCreateSchema } from '@/schemas/liability'

export async function GET(req: Request) {
  await dbConnect()
  const userId = await getUserId()
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') as 'credit-card' | 'loan' | null
  const page = Number(searchParams.get('page') || '1')
  const limit = Math.min(Number(searchParams.get('limit') || '20'), 100)
  const skip = (Math.max(page, 1) - 1) * limit

  const query: Record<string, unknown> = { userId }
  if (type) query.type = type

  const [items, total] = await Promise.all([
    Liability.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Liability.countDocuments(query),
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
  const parsed = liabilityCreateSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const doc = await Liability.create({ ...parsed.data, userId })
  return NextResponse.json({ item: doc }, { status: 201 })
}
