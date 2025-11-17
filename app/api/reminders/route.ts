import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import { Liability } from '@/models/Liability'

function nextDueDate(liability: { dueDay?: number; nextDueDate?: Date }) {
  if (liability.nextDueDate) return liability.nextDueDate
  if (liability.dueDay) {
    const now = new Date()
    const due = new Date(now.getFullYear(), now.getMonth(), liability.dueDay)
    if (due < now) due.setMonth(due.getMonth() + 1)
    return due
  }
  return undefined
}

export async function GET() {
  try {
    await dbConnect()
    const userId = await getUserId()

    const liabilities = await Liability.find({ userId, status: 'open' }).lean()
    const now = new Date()
    const horizonMs = 14 * 86400000

    type LeanLiability = {
      _id: unknown
      name: string
      type: string
      balanceCents: number
      minPaymentCents?: number
      dueDay?: number
      nextDueDate?: Date
    }

    const upcoming = (liabilities as unknown as LeanLiability[])
      .map((l) => ({
        id: String(l._id),
        name: l.name,
        type: l.type,
        balanceCents: l.balanceCents,
        minPaymentCents: l.minPaymentCents ?? 0,
        dueDate: nextDueDate({ dueDay: l.dueDay, nextDueDate: l.nextDueDate }),
      }))
      .filter(
        (l) =>
          l.dueDate &&
          (l.dueDate as Date).getTime() - now.getTime() <= horizonMs,
      )
      .sort(
        (a, b) => (a.dueDate as Date).getTime() - (b.dueDate as Date).getTime(),
      )
      .map((l) => ({
        id: l.id,
        name: l.name,
        type: l.type,
        balanceCents: l.balanceCents,
        minPaymentCents: l.minPaymentCents,
        dueDate: l.dueDate,
      }))

    return NextResponse.json({ upcoming })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to load reminders'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
