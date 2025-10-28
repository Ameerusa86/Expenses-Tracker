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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          Welcome back, {name}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Track your expenses and manage your budget efficiently
        </p>
      </div>

      {/* Monthly Overview - Primary Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-emerald-500 dark:bg-emerald-600 text-white">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <div className="relative p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-100">
                  Monthly Income
                </p>
                <p className="text-xs text-emerald-200">
                  {new Date().toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <p className="text-3xl sm:text-4xl font-bold">
              {formatCurrency(monthlyIncome)}
            </p>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-rose-500 dark:bg-rose-600 text-white">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <div className="relative p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <TrendingDown className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-rose-100">
                  Monthly Expenses
                </p>
                <p className="text-xs text-rose-200">
                  {new Date().toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <p className="text-3xl sm:text-4xl font-bold">
              {formatCurrency(monthlyExpenses)}
            </p>
          </div>
        </Card>

        <Card
          className={`relative overflow-hidden border-0 shadow-lg text-white ${
            netIncome >= 0
              ? 'bg-blue-500 dark:bg-blue-600'
              : 'bg-orange-500 dark:bg-orange-600'
          }`}
        >
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <div className="relative p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">Net Balance</p>
                <p className="text-xs opacity-75">This Month</p>
              </div>
            </div>
            <p className="text-3xl sm:text-4xl font-bold">
              {formatCurrency(netIncome)}
            </p>
          </div>
        </Card>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
        <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <Link
                href="/accounts"
                className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
              >
                View
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Accounts
              </p>
              <p className="text-3xl font-bold mt-1">{accountsCount}</p>
            </div>
          </div>
        </Card>

        <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Tags className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <Link
                href="/categories"
                className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
              >
                View
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Categories
              </p>
              <p className="text-3xl font-bold mt-1">{categoriesCount}</p>
            </div>
          </div>
        </Card>

        <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Receipt className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <Link
                href="/transactions"
                className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
              >
                View
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Transactions
              </p>
              <p className="text-3xl font-bold mt-1">{transactionsCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Recent Transactions</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your latest financial activity
              </p>
            </div>
            <Link href="/transactions">
              <Button variant="default" size="sm" className="w-full sm:w-auto">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {serializedTransactions.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Receipt className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No transactions yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start tracking your finances by adding your first transaction
              </p>
              <Link href="/transactions">
                <Button>Add Transaction</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {serializedTransactions.map(
                (txn: {
                  _id: string
                  payee?: string
                  amountCents: number
                  date: string
                }) => (
                  <div
                    key={txn._id}
                    className="flex items-center justify-between gap-4 rounded-xl border bg-muted/20 p-4 transition-all hover:bg-muted/40 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                          txn.amountCents >= 0
                            ? 'bg-emerald-100 dark:bg-emerald-950'
                            : 'bg-rose-100 dark:bg-rose-950'
                        }`}
                      >
                        {txn.amountCents >= 0 ? (
                          <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-semibold truncate">
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
                      className={`text-lg font-bold shrink-0 ${
                        txn.amountCents >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
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
