import { dbConnect } from '@/lib/db'
import { Transaction } from '@/models/Transaction'
import { Account } from '@/models/Account'
import { Category } from '@/models/Category'
import { getUserId } from '@/lib/auth'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/utils/money'
import { ArrowLeft } from 'lucide-react'
import { deleteTransaction } from '@/app/actions/transactions'

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await dbConnect()
  const userId = await getUserId()

  const [txn, accounts, categories] = await Promise.all([
    Transaction.findOne({ _id: id, userId }).lean(),
    Account.find({ userId }).lean(),
    Category.find({ userId }).lean(),
  ])

  if (!txn) return notFound()

  type BasicDoc = { _id: string; name: string }
  const serializedTxn = JSON.parse(JSON.stringify(txn))
  const serializedAccounts: BasicDoc[] = JSON.parse(JSON.stringify(accounts))
  const serializedCategories: BasicDoc[] = JSON.parse(
    JSON.stringify(categories),
  )

  async function onDelete() {
    'use server'
    await deleteTransaction(id)
    redirect('/transactions')
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/transactions"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Transactions</span>
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground font-medium">Edit</span>
          </nav>

          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Edit Transaction
              </h1>
              <p className="text-muted-foreground">
                Update details or delete this transaction
              </p>
            </div>

            <Card className="p-6 sm:p-8 border-0 shadow-sm">
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground tracking-wider mb-1">
                      Account
                    </p>
                    <p className="font-medium">
                      {serializedAccounts.find(
                        (a) => a._id === serializedTxn.accountId,
                      )?.name || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground tracking-wider mb-1">
                      Category
                    </p>
                    <p className="font-medium">
                      {serializedCategories.find(
                        (c) => c._id === serializedTxn.categoryId,
                      )?.name || 'Uncategorized'}
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground tracking-wider mb-1">
                      Amount
                    </p>
                    <p
                      className={`font-bold ${
                        serializedTxn.amountCents >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {formatCurrency(serializedTxn.amountCents)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground tracking-wider mb-1">
                      Date
                    </p>
                    <p className="font-medium">
                      {new Date(serializedTxn.date).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        },
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wider mb-1">
                    Notes
                  </p>
                  <p className="font-medium whitespace-pre-wrap">
                    {serializedTxn.notes || '-'}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <form action={onDelete}>
                    <Button variant="destructive" type="submit">
                      Delete
                    </Button>
                  </form>
                  <Link href="/transactions">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
