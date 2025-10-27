import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { dbConnect } from '@/lib/db'
import { Transaction } from '@/models/Transaction'
import { Account } from '@/models/Account'
import { Category } from '@/models/Category'
import { getUserId } from '@/lib/auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatCurrency } from '@/utils/money'

export default async function DashboardPage() {
  const session = (await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  })) as {
    user?: {
      name?: string | null
      email?: string | null
      image?: string | null
    } | null
  } | null
  const name = session?.user?.name ?? session?.user?.email ?? 'there'

  // Get user data
  await dbConnect()
  const userId = await getUserId()

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
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Welcome back, {name} 👋</h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your finances
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Accounts</p>
            <p className="text-3xl font-bold">{accountsCount}</p>
            <Link href="/accounts">
              <Button variant="link" className="h-auto p-0 text-sm">
                Manage accounts →
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Categories</p>
            <p className="text-3xl font-bold">{categoriesCount}</p>
            <Link href="/categories">
              <Button variant="link" className="h-auto p-0 text-sm">
                Manage categories →
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-3xl font-bold">{transactionsCount}</p>
            <Link href="/transactions">
              <Button variant="link" className="h-auto p-0 text-sm">
                View all →
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Monthly Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">This Month Income</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(monthlyIncome)}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">This Month Expenses</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(monthlyExpenses)}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Net Income</p>
            <p
              className={`text-2xl font-bold ${
                netIncome >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(netIncome)}
            </p>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <Link href="/transactions">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {serializedTransactions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No transactions yet.</p>
            <Link href="/transactions/new">
              <Button className="mt-4">Add Your First Transaction</Button>
            </Link>
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
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{txn.payee || 'Transaction'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(txn.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p
                    className={`text-lg font-semibold ${
                      txn.amountCents >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(txn.amountCents)}
                  </p>
                </div>
              ),
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
