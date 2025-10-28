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
import { Wallet, Tags, ArrowLeft, Receipt } from 'lucide-react'

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
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground font-medium">Transactions</span>
          </nav>

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

          {/* Desktop Table View - Hidden on mobile */}
          <Card className="hidden lg:block overflow-hidden border-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Payee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Account
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {!hasAccounts ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16">
                        <div className="flex flex-col items-center gap-6 max-w-md mx-auto text-center">
                          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Wallet className="h-10 w-10 text-primary" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-semibold">
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
                      <td colSpan={7} className="px-6 py-16">
                        <div className="flex flex-col items-center gap-6 max-w-md mx-auto text-center">
                          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Receipt className="h-10 w-10 text-primary" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-semibold">
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
                        className="transition-colors hover:bg-muted/30 group"
                      >
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <div className="font-medium">
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
                          <div className="font-semibold">
                            {txn.payee || '-'}
                          </div>
                          {txn.notes && (
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              {txn.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center gap-1.5">
                            {txn.categoryId
                              ? categoryMap.get(txn.categoryId) || 'Unknown'
                              : 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {accountMap.get(txn.accountId) || 'Unknown'}
                        </td>
                        <td
                          className={`px-6 py-4 text-right text-sm font-bold whitespace-nowrap ${
                            txn.amountCents >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {formatCurrency(txn.amountCents)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                              txn.status === 'cleared'
                                ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                                : txn.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
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
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
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
              <Card className="p-12 sm:p-16 text-center border-2 border-dashed">
                <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                  <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Wallet className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">No accounts yet</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Create an account to start adding transactions
                    </p>
                  </div>
                  <AddAccountModal />
                </div>
              </Card>
            ) : serializedTransactions.length === 0 ? (
              <Card className="p-12 sm:p-16 text-center border-2 border-dashed">
                <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                  <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Receipt className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">
                      No transactions yet
                    </h3>
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
                  className="p-5 hover:shadow-lg transition-all duration-200 border-0 shadow-sm"
                >
                  <div className="space-y-4">
                    {/* Header with payee and amount */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-base truncate">
                          {txn.payee || 'Transaction'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
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
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {formatCurrency(txn.amountCents)}
                      </p>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                          Account
                        </p>
                        <p className="font-medium text-sm truncate">
                          {accountMap.get(txn.accountId) || 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                          Category
                        </p>
                        <p className="font-medium text-sm truncate">
                          {txn.categoryId
                            ? categoryMap.get(txn.categoryId) || 'Unknown'
                            : 'Uncategorized'}
                        </p>
                      </div>
                    </div>

                    {/* Footer with status and action */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ${
                          txn.status === 'cleared'
                            ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                            : txn.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                        }`}
                      >
                        {txn.status}
                      </span>
                      <Link href={`/transactions/${txn._id}`}>
                        <Button variant="ghost" size="sm">
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
