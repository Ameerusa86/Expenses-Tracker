import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { dbConnect } from '@/lib/db'
import { Transaction } from '@/models/Transaction'
import { Account } from '@/models/Account'
import { Category } from '@/models/Category'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

  // Get recent transactions
  const recentTransactions = await Transaction.find({ userId })
    .sort({ date: -1 })
    .limit(5)
    .lean()

  const serializedTransactions = JSON.parse(JSON.stringify(recentTransactions))

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl border border-primary/35 bg-gradient-to-br from-primary via-primary/92 to-primary/75 p-8 text-primary-foreground shadow-[0_30px_90px_-40px_rgba(58,16,149,0.6)]">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 rounded-l-[5rem] bg-primary-foreground/15 blur-3xl lg:block" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/80">
                Financial overview
              </span>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Welcome back, {name}
              </h1>
              <p className="max-w-xl text-sm text-primary-foreground/80 sm:text-base">
                Stay ahead of your spending with real-time tracking, category
                insights, and guided budgets built to scale with you.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-primary-foreground/20 bg-primary/25 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/75">
                  This month&apos;s income
                </p>
                <p className="mt-3 text-3xl font-semibold text-primary-foreground">
                  {formatCurrency(monthlyIncome)}
                </p>
                <p className="mt-1 text-xs text-primary-foreground/70">
                  {new Date().toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="rounded-2xl border border-primary-foreground/20 bg-primary/20 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/75">
                  Active accounts
                </p>
                <p className="mt-3 text-3xl font-semibold text-primary-foreground">
                  {accountsCount}
                </p>
                <p className="mt-1 text-xs text-primary-foreground/70">
                  connected sources
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 text-white shadow-[0_35px_70px_-40px_rgba(16,185,129,0.65)]">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-1/3 -translate-y-1/2 rounded-full bg-primary-foreground/25 blur-3xl" />
            <div className="relative space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/20">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/70">
                    Income
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(monthlyIncome)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-white/70">
                Updated{' '}
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600 text-white shadow-[0_35px_70px_-40px_rgba(244,63,94,0.6)]">
            <div className="absolute right-0 top-0 h-28 w-28 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary-foreground/25 blur-3xl" />
            <div className="relative space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/20">
                  <TrendingDown className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/70">
                    Expenses
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(monthlyExpenses)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-white/70">Across all categories</p>
            </div>
          </Card>

          <Card
            className={`relative overflow-hidden border-0 text-white shadow-[0_35px_70px_-40px_rgba(79,70,229,0.55)] ${
              netIncome >= 0
                ? 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700'
                : 'bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500'
            }`}
          >
            <div className="absolute right-0 top-0 h-28 w-28 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary-foreground/25 blur-3xl" />
            <div className="relative space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/20">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/70">
                    Net balance
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(netIncome)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-white/70">
                Difference between income and expenses
              </p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="group bg-surface/95 transition hover:border-primary/40 hover:shadow-glow dark:bg-surface/65">
          <div className="space-y-5 px-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary transition group-hover:scale-105">
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

        <Card className="group bg-surface/95 transition hover:border-primary/40 hover:shadow-glow dark:bg-surface/65">
          <div className="space-y-5 px-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 text-primary transition group-hover:scale-105">
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

        <Card className="group bg-surface/95 transition hover:border-primary/40 hover:shadow-glow dark:bg-surface/65">
          <div className="space-y-5 px-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary transition group-hover:scale-105">
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

      <Card className="border border-border/60 bg-surface/95 dark:border-border/60 dark:bg-surface/65">
        <div className="space-y-6 p-6 sm:p-8">
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
            <div className="rounded-3xl border border-dashed border-muted/60 bg-muted/20 px-6 py-14 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
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
                    className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-surface/90 p-4 transition hover:border-primary/30 hover:shadow-glow dark:border-border/60 dark:bg-surface/60 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-1 items-center gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
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
