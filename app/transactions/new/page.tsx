import { dbConnect } from '@/lib/db'
import { Account } from '@/models/Account'
import { Category } from '@/models/Category'
import { getUserId } from '@/lib/auth'
import { TransactionForm } from '@/components/transactions/transaction-form'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function NewTransactionPage() {
  await dbConnect()
  const userId = await getUserId()

  const accounts = await Account.find({ userId }).sort({ name: 1 }).lean()
  const categories = await Category.find({ userId }).sort({ name: 1 }).lean()

  const serializedAccounts = JSON.parse(JSON.stringify(accounts))
  const serializedCategories = JSON.parse(JSON.stringify(categories))

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">New Transaction</h1>
        <p className="text-muted-foreground">
          Add a new income or expense transaction
        </p>
      </div>

      {serializedAccounts.length === 0 ? (
        <Card className="p-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">You need an account first</h2>
            <p className="text-muted-foreground">
              Create at least one account before adding transactions.
            </p>
            <Link href="/accounts/new">
              <Button className="mt-2">Create your first account</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <TransactionForm
          accounts={serializedAccounts}
          categories={serializedCategories}
        />
      )}
    </div>
  )
}
