import { dbConnect } from '@/lib/db'
import { Transaction } from '@/models/Transaction'
import { Account } from '@/models/Account'
import { Category } from '@/models/Category'
import { getUserId } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { formatCurrency } from '@/utils/money'

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

  // Fetch transactions with related data
  const transactions = await Transaction.find({ userId })
    .sort({ date: -1 })
    .limit(50)
    .lean()

  const accounts = await Account.find({ userId }).lean()
  const categories = await Category.find({ userId }).lean()

  // Create lookup maps
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

  const hasAccounts = accounts.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Track and manage all your transactions
          </p>
        </div>
        {hasAccounts ? (
          <Link href="/transactions/new">
            <Button>Add Transaction</Button>
          </Link>
        ) : (
          <Link href="/accounts/new">
            <Button>Add Account</Button>
          </Link>
        )}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Payee
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Account
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  Amount
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {!hasAccounts ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    You don&apos;t have any accounts yet. Create an account to
                    start adding transactions.
                  </td>
                </tr>
              ) : serializedTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No transactions yet. Click &quot;Add Transaction&quot; to
                    get started.
                  </td>
                </tr>
              ) : (
                serializedTransactions.map((txn) => (
                  <tr key={txn._id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">
                      {new Date(txn.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">{txn.payee || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {txn.categoryId
                        ? categoryMap.get(txn.categoryId) || 'Unknown'
                        : 'Uncategorized'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {accountMap.get(txn.accountId) || 'Unknown'}
                    </td>
                    <td
                      className={`px-4 py-3 text-right text-sm font-medium ${
                        txn.amountCents >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(txn.amountCents)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          txn.status === 'cleared'
                            ? 'bg-green-100 text-green-700'
                            : txn.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/transactions/${txn._id}`}>
                        <Button variant="outline" size="sm">
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
    </div>
  )
}
