import { dbConnect } from '@/lib/db'
import { Transaction } from '@/models/Transaction'
import { Account } from '@/models/Account'
import { Category } from '@/models/Category'
import { getUserId } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AddTransactionModal } from '@/components/transactions/add-transaction-modal'
import Link from 'next/link'
import { formatCurrency } from '@/utils/money'
import { AddAccountModal } from '@/components/accounts/add-account-modal'
import {
  Wallet,
  Tags,
  Receipt,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react'
import { Types } from 'mongoose'

interface SerializedTransaction {
  _id: string
  accountId: string
  categoryId?: string
  amountCents: number
  date: string
  payee?: string
  notes?: string
  status: 'cleared' | 'pending' | 'reconciled'
}

export default async function TransactionsPage() {
  await dbConnect()
  const userId = await getUserId()

  const transactions = await Transaction.find({ userId })
    .sort({ date: -1 })
    .limit(50)
    .lean()

  const accounts = await Account.find({ userId }).lean()
  const categories = await Category.find({ userId }).lean()

  // Calculate this month's summary
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthSummary = await Transaction.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        date: { $gte: monthStart },
      },
    },
    {
      $group: {
        _id: null,
        income: {
          $sum: { $cond: [{ $gte: ['$amountCents', 0] }, '$amountCents', 0] },
        },
        expense: {
          $sum: { $cond: [{ $lt: ['$amountCents', 0] }, '$amountCents', 0] },
        },
        total: { $sum: '$amountCents' },
      },
    },
  ]).exec()

  const summary = monthSummary[0] || { income: 0, expense: 0, total: 0 }

  const accountMap = new Map(
    accounts.map((acc) => [
      (
        acc as unknown as { _id: { toString: () => string }; name: string }
      )._id.toString(),
      (acc as unknown as { name: string }).name,
    ]),
  )
  const categoryMap = new Map(
    categories.map((cat) => [
      (
        cat as unknown as { _id: { toString: () => string }; name: string }
      )._id.toString(),
      (cat as unknown as { name: string }).name,
    ]),
  )

  const serializedTransactions: SerializedTransaction[] = JSON.parse(
    JSON.stringify(transactions),
  )
  const serializedAccounts = JSON.parse(JSON.stringify(accounts))
  const serializedCategories = JSON.parse(JSON.stringify(categories))

  const hasAccounts = accounts.length > 0

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Header Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Transactions
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  Track and manage all your financial transactions
                </p>
              </div>
              <div className="shrink-0">
                {hasAccounts ? (
                  <AddTransactionModal
                    accounts={serializedAccounts}
                    categories={serializedCategories}
                  />
                ) : (
                  <AddAccountModal />
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-2">
              <Link href="/accounts">
                <Button variant="outline" size="sm" className="gap-2 h-9">
                  <Wallet className="h-4 w-4" />
                  <span className="hidden xs:inline">Manage Accounts</span>
                  <span className="xs:hidden">Accounts</span>
                </Button>
              </Link>
              <Link href="/categories">
                <Button variant="outline" size="sm" className="gap-2 h-9">
                  <Tags className="h-4 w-4" />
                  <span className="hidden xs:inline">Manage Categories</span>
                  <span className="xs:hidden">Categories</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Monthly Summary Cards */}
          {hasAccounts && serializedTransactions.length > 0 && (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
              {/* Income Card */}
              <Card className="p-6 transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      This Month Income
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(summary.income)}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </Card>

              {/* Expense Card */}
              <Card className="p-6 transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      This Month Expenses
                    </p>
                    <p className="text-2xl font-bold text-rose-600">
                      {formatCurrency(summary.expense)}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-rose-600" />
                  </div>
                </div>
              </Card>

              {/* Net Card */}
              <Card className="p-6 transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Net Cash Flow
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        summary.total >= 0
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {formatCurrency(summary.total)}
                    </p>
                  </div>
                  <div
                    className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                      summary.total >= 0
                        ? 'bg-emerald-100 dark:bg-emerald-950/30'
                        : 'bg-rose-100 dark:bg-rose-950/30'
                    }`}
                  >
                    <DollarSign
                      className={`h-6 w-6 ${
                        summary.total >= 0
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Desktop Table View - Hidden on mobile */}
          <Card className="hidden lg:block overflow-hidden border-0 shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-border bg-muted/50">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground">
                      Payee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground">
                      Account
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-foreground">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 bg-card">
                  {!hasAccounts ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-20">
                        <div className="flex flex-col items-center gap-6 max-w-md mx-auto text-center">
                          <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Wallet className="h-10 w-10 text-primary" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold">
                              No accounts yet
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              Create an account to start adding transactions
                            </p>
                          </div>
                          <AddAccountModal />
                        </div>
                      </td>
                    </tr>
                  ) : serializedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-20">
                        <div className="flex flex-col items-center gap-6 max-w-md mx-auto text-center">
                          <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Receipt className="h-10 w-10 text-primary" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold">
                              No transactions yet
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              Click &quot;Add Transaction&quot; to get started
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    serializedTransactions.map((txn) => (
                      <tr
                        key={txn._id}
                        className="transition-all hover:bg-muted/50 group"
                      >
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <div className="font-semibold text-foreground">
                            {new Date(txn.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(txn.date).getFullYear()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-semibold text-foreground">
                            {txn.payee || '-'}
                          </div>
                          {txn.notes && (
                            <div className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">
                              {txn.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {txn.categoryId
                            ? categoryMap.get(txn.categoryId) || 'Unknown'
                            : 'Uncategorized'}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground font-medium">
                          {accountMap.get(txn.accountId) || 'Unknown'}
                        </td>
                        <td
                          className={`px-6 py-4 text-right text-sm font-bold whitespace-nowrap ${
                            txn.amountCents >= 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {formatCurrency(txn.amountCents)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                              txn.status === 'cleared'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                : txn.status === 'pending'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                                  : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400'
                            }`}
                          >
                            {txn.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/transactions/${txn._id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary"
                            >
                              Edit
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile Card View - Visible only on mobile/tablet */}
          <div className="lg:hidden space-y-4">
            {!hasAccounts ? (
              <Card className="p-12 sm:p-16 text-center border-2 border-dashed shadow-md">
                <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                  <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wallet className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">No accounts yet</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Create an account to start adding transactions
                    </p>
                  </div>
                  <AddAccountModal />
                </div>
              </Card>
            ) : serializedTransactions.length === 0 ? (
              <Card className="p-12 sm:p-16 text-center border-2 border-dashed shadow-md">
                <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                  <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Receipt className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">No transactions yet</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Click &quot;Add Transaction&quot; to get started
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              serializedTransactions.map((txn) => (
                <Card
                  key={txn._id}
                  className="p-5 transition-all hover:shadow-lg"
                >
                  <div className="space-y-4">
                    {/* Header with payee and amount */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-base truncate text-foreground">
                          {txn.payee || 'Transaction'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1.5">
                          {new Date(txn.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <p
                        className={`text-xl font-bold shrink-0 ${
                          txn.amountCents >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatCurrency(txn.amountCents)}
                      </p>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                      <div>
                        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">
                          Account
                        </p>
                        <p className="font-semibold text-sm truncate text-foreground">
                          {accountMap.get(txn.accountId) || 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">
                          Category
                        </p>
                        <p className="font-semibold text-sm truncate text-foreground">
                          {txn.categoryId
                            ? categoryMap.get(txn.categoryId) || 'Unknown'
                            : 'Uncategorized'}
                        </p>
                      </div>
                    </div>

                    {/* Footer with status and action */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                          txn.status === 'cleared'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : txn.status === 'pending'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                              : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400'
                        }`}
                      >
                        {txn.status}
                      </span>
                      <Link href={`/transactions/${txn._id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
