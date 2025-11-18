import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { dbConnect } from '@/lib/db'
import { Transaction } from '@/models/Transaction'
import { Account } from '@/models/Account'
import { Category } from '@/models/Category'
import { Card } from '@/components/ui/card'
import { Donut } from '@/components/ui/donut'
import { Liability } from '@/models/Liability'
import { Button } from '@/components/ui/button'
import { RecurringIncome } from '@/models/RecurringIncome'
import { biWeeklyOccurrences } from '@/lib/recurrence'
import Link from 'next/link'
import { formatCurrency } from '@/utils/money'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Tags,
  Receipt,
  ArrowRight,
} from 'lucide-react'
import { Bars } from '@/components/ui/bars'
import { Sparkline } from '@/components/ui/sparkline'

export default async function DashboardPage() {
  const session = (await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  })) as {
    user?: {
      name?: string | null
      email?: string | null
      image?: string | null
      id?: string | null
    } | null
  } | null

  // Redirect to login if not authenticated
  if (!session?.user?.id) {
    redirect('/login')
  }

  const name = session.user.name ?? session.user.email ?? 'there'
  const userId = session.user.id

  // Get user data
  await dbConnect()

  // Get counts and recent data
  const accountsCount = await Account.countDocuments({ userId })
  const categoriesCount = await Category.countDocuments({ userId })
  const transactionsCount = await Transaction.countDocuments({ userId })

  // Get current month transactions
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const monthlyTransactions = await Transaction.find({
    userId,
    date: { $gte: startOfMonth },
  }).lean()

  // Calculate monthly totals
  const monthlyIncome = monthlyTransactions
    .filter((t) => (t as unknown as { amountCents: number }).amountCents > 0)
    .reduce(
      (sum, t) => sum + (t as unknown as { amountCents: number }).amountCents,
      0,
    )

  const monthlyExpenses = Math.abs(
    monthlyTransactions
      .filter((t) => (t as unknown as { amountCents: number }).amountCents < 0)
      .reduce(
        (sum, t) => sum + (t as unknown as { amountCents: number }).amountCents,
        0,
      ),
  )

  const netIncome = monthlyIncome - monthlyExpenses

  // Previous month window
  const prevStart = new Date(startOfMonth)
  prevStart.setMonth(prevStart.getMonth() - 1)
  const prevMonthTxns = await Transaction.find({
    userId,
    date: { $gte: prevStart, $lt: startOfMonth },
  }).lean()
  const prevIncome = prevMonthTxns
    .filter((t) => (t as unknown as { amountCents: number }).amountCents > 0)
    .reduce(
      (sum, t) => sum + (t as unknown as { amountCents: number }).amountCents,
      0,
    )
  const prevExpenses = Math.abs(
    prevMonthTxns
      .filter((t) => (t as unknown as { amountCents: number }).amountCents < 0)
      .reduce(
        (sum, t) => sum + (t as unknown as { amountCents: number }).amountCents,
        0,
      ),
  )
  const prevNet = prevIncome - prevExpenses

  // Get recent transactions
  const recentTransactions = await Transaction.find({ userId })
    .sort({ date: -1 })
    .limit(5)
    .lean()

  const serializedTransactions = JSON.parse(JSON.stringify(recentTransactions))

  // Upcoming payments (next 14 days)
  const now = new Date()
  const horizonMs = 14 * 86400000
  const rawLiabilities = await Liability.find({ userId, status: 'open' }).lean()
  function computeNextDue(l: { dueDay?: number; nextDueDate?: Date }) {
    if (l.nextDueDate) return l.nextDueDate
    if (l.dueDay) {
      const d = new Date(now.getFullYear(), now.getMonth(), l.dueDay)
      if (d < now) d.setMonth(d.getMonth() + 1)
      return d
    }
    return undefined
  }
  const upcoming = rawLiabilities
    .map((l: any) => ({
      id: String(l._id),
      name: l.name as string,
      minPaymentCents: (l.minPaymentCents ?? 0) as number,
      dueDate: computeNextDue(l as { dueDay?: number; nextDueDate?: Date }),
    }))
    .filter(
      (l) =>
        l.dueDate && (l.dueDate as Date).getTime() - now.getTime() <= horizonMs,
    )
    .sort(
      (a, b) => (a.dueDate as Date).getTime() - (b.dueDate as Date).getTime(),
    )
    .slice(0, 5)

  // Next paychecks (bi-weekly) — show next 3 aggregated by date
  const incomes = await RecurringIncome.find({ userId }).lean()
  const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const pays = incomes.flatMap((inc: any) => {
    if (inc.frequency !== 'bi-weekly')
      return [] as { date: Date; amountCents: number }[]
    const occ = biWeeklyOccurrences(new Date(inc.startDate), 6, nowStart)
    return occ.map((d) => ({ date: d, amountCents: inc.amountCents as number }))
  })
  const grouped = new Map<string, number>()
  for (const p of pays) {
    const key = new Date(
      p.date.getFullYear(),
      p.date.getMonth(),
      p.date.getDate(),
    ).toISOString()
    grouped.set(key, (grouped.get(key) || 0) + p.amountCents)
  }
  const nextPays = [...grouped.entries()]
    .map(([k, v]) => ({ date: new Date(k), amountCents: v }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3)

  // Credit cards summary
  const creditCards = rawLiabilities.filter(
    (l: any) => l.type === 'credit-card',
  )
  const ccBalance = creditCards.reduce(
    (s: number, l: any) => s + (l.balanceCents || 0),
    0,
  )
  const ccLimit = creditCards.reduce(
    (s: number, l: any) => s + (l.creditLimitCents || 0),
    0,
  )
  const ccUtil =
    ccLimit > 0 ? Math.min(100, Math.round((ccBalance / ccLimit) * 100)) : 0

  // Last 30 days series for mini charts
  const windowStart = new Date(now)
  windowStart.setDate(windowStart.getDate() - 29)
  windowStart.setHours(0, 0, 0, 0)
  const lastWindow = await Transaction.find({
    userId,
    date: { $gte: windowStart },
  }).lean()
  const dayKey = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()
  const daily = new Map<string, number>()
  for (let i = 0; i < 30; i++) {
    const d = new Date(windowStart)
    d.setDate(d.getDate() + i)
    daily.set(dayKey(d), 0)
  }
  for (const t of lastWindow) {
    const v = (t as unknown as { amountCents: number }).amountCents
    const k = dayKey((t as any).date as Date)
    daily.set(k, (daily.get(k) || 0) + v)
  }
  const last7Keys = Array.from(daily.keys()).slice(-7)
  const last7 = last7Keys.map((k) => daily.get(k) || 0)
  const last30Cumulative = Array.from(daily.values()).reduce<number[]>(
    (acc, v) => {
      const prev = acc.length ? acc[acc.length - 1] : 0
      acc.push(prev + v)
      return acc
    },
    [],
  )

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Top summary row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between px-6 pb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Summary
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between gap-6">
                  <span className="text-sm text-muted-foreground">
                    Balance:
                  </span>
                  <span
                    className={`text-sm font-semibold ${netIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                  >
                    {formatCurrency(netIncome)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-sm text-muted-foreground">Income:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(monthlyIncome)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-sm text-muted-foreground">
                    Expenses:
                  </span>
                  <span className="text-sm font-medium">
                    -{formatCurrency(monthlyExpenses)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-sm text-muted-foreground">
                    Credit cards:
                  </span>
                  <span className="text-sm font-medium text-rose-600">
                    -{formatCurrency(ccBalance)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4 px-6 pb-6">
            <Donut
              value={
                monthlyIncome + monthlyExpenses === 0
                  ? 0
                  : (monthlyIncome / (monthlyIncome + monthlyExpenses)) * 100
              }
              size={72}
              stroke={10}
              valueColor="#22c55e"
              trackColor="#ef4444"
            />
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                This month
              </p>
              <p className="text-sm font-semibold">
                {formatCurrency(monthlyIncome - monthlyExpenses)}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { month: 'long' })}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4 px-6 pb-6">
            <Donut
              value={
                prevIncome + prevExpenses === 0
                  ? 0
                  : (prevIncome / (prevIncome + prevExpenses)) * 100
              }
              size={72}
              stroke={10}
              valueColor="#22c55e"
              trackColor="#ef4444"
            />
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Last month
              </p>
              <p className="text-sm font-semibold">{formatCurrency(prevNet)}</p>
              <p className="text-xs text-muted-foreground">
                {prevStart.toLocaleDateString('en-US', { month: 'long' })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="group transition">
          <div className="space-y-5 px-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Wallet className="h-6 w-6" />
              </div>
              <Link
                href="/accounts"
                className="text-sm font-medium text-primary hover:underline"
              >
                View
              </Link>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Accounts
              </p>
              <p className="mt-2 text-3xl font-semibold">{accountsCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Linked wallets & banks
              </p>
            </div>
          </div>
        </Card>

        <Card className="group transition">
          <div className="space-y-5 px-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-accent/20 text-primary">
                <Tags className="h-6 w-6" />
              </div>
              <Link
                href="/categories"
                className="text-sm font-medium text-primary hover:underline"
              >
                View
              </Link>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Categories
              </p>
              <p className="mt-2 text-3xl font-semibold">{categoriesCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Organise spend for clarity
              </p>
            </div>
          </div>
        </Card>

        <Card className="group transition">
          <div className="space-y-5 px-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-secondary text-primary">
                <Receipt className="h-6 w-6" />
              </div>
              <Link
                href="/transactions"
                className="text-sm font-medium text-primary hover:underline"
              >
                View
              </Link>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Transactions
              </p>
              <p className="mt-2 text-3xl font-semibold">{transactionsCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Recorded over the last 30 days
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Credit cards and charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="space-y-4 px-6 pb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Credit cards</p>
              {ccLimit > 0 ? (
                <span className="text-xs text-muted-foreground">
                  {ccUtil}% used
                </span>
              ) : null}
            </div>
            <div className="text-sm text-rose-600 font-semibold">
              -{formatCurrency(ccBalance)}
            </div>
            <div className="h-2 w-full rounded bg-muted">
              <div
                className="h-full rounded bg-emerald-500"
                style={{ width: `${ccLimit > 0 ? ccUtil : 0}%` }}
              />
            </div>
          </div>
        </Card>
        <Card>
          <div className="space-y-4 px-6 pb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Last 7 days</p>
            </div>
            <Bars values={last7.map((v) => v / 100)} width={220} height={70} />
          </div>
        </Card>
        <Card>
          <div className="space-y-4 px-6 pb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Balance</p>
            </div>
            <Sparkline
              points={last30Cumulative.map((v) => v / 100)}
              width={220}
              height={70}
            />
          </div>
        </Card>
      </div>

      <Card>
        <div className="space-y-6 p-6 sm:p-8">
          {/* Next Paychecks */}
          <div className="rounded-lg border bg-muted/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Next paychecks</h3>
              <Link
                href="/planner"
                className="text-xs text-primary hover:underline"
              >
                Plan
              </Link>
            </div>
            {nextPays.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No upcoming paychecks configured.
              </p>
            ) : (
              <div className="space-y-2">
                {nextPays.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-surface/70 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {p.date.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm font-semibold">
                      {formatCurrency(p.amountCents)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Payments Widget */}
          <div className="rounded-lg border bg-muted/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                Upcoming payments (14 days)
              </h3>
              <Link
                href="/credit-loans"
                className="text-xs text-primary hover:underline"
              >
                Manage
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No payments due soon.
              </p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-xl bg-surface/70 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {(u.dueDate as Date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm font-semibold">
                      {formatCurrency(u.minPaymentCents || 0)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Recent transactions
              </h2>
              <p className="text-sm text-muted-foreground">
                A snapshot of your latest financial activity
              </p>
            </div>
            <Link href="/transactions" className="sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {serializedTransactions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-muted/60 bg-muted/20 px-6 py-14 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                <Receipt className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No transactions yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Start tracking by adding your first transaction
              </p>
              <div className="mt-6 flex justify-center">
                <Link href="/transactions">
                  <Button size="sm">Add transaction</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {serializedTransactions.map(
                (txn: {
                  _id: string
                  payee?: string
                  amountCents: number
                  date: string
                }) => (
                  <div
                    key={txn._id}
                    className="group flex flex-col gap-4 rounded-xl border bg-background p-4 transition sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-1 items-center gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md ${
                          txn.amountCents >= 0
                            ? 'bg-emerald-500/15 text-emerald-600'
                            : 'bg-rose-500/15 text-rose-500'
                        }`}
                      >
                        {txn.amountCents >= 0 ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : (
                          <TrendingDown className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="truncate text-sm font-medium">
                          {txn.payee || 'Transaction'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(txn.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-lg font-semibold sm:text-xl ${
                        txn.amountCents >= 0
                          ? 'text-emerald-600'
                          : 'text-rose-500'
                      }`}
                    >
                      {txn.amountCents >= 0 ? '+' : ''}
                      {formatCurrency(txn.amountCents)}
                    </p>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
