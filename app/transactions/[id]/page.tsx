import { dbConnect } from '@/lib/db'
import { Transaction } from '@/models/Transaction'
import { Account } from '@/models/Account'
import { Category } from '@/models/Category'
import { getUserId } from '@/lib/auth'
import { TransactionForm } from '@/components/transactions/transaction-form'
import { notFound } from 'next/navigation'

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await dbConnect()
  const userId = await getUserId()

  const transaction = await Transaction.findOne({ _id: id, userId }).lean()
  if (!transaction) {
    notFound()
  }

  const accounts = await Account.find({ userId }).sort({ name: 1 }).lean()
  const categories = await Category.find({ userId }).sort({ name: 1 }).lean()

  const serializedTransaction = JSON.parse(JSON.stringify(transaction))
  const serializedAccounts = JSON.parse(JSON.stringify(accounts))
  const serializedCategories = JSON.parse(JSON.stringify(categories))

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Transaction</h1>
        <p className="text-muted-foreground">Update transaction details</p>
      </div>

      <TransactionForm
        transaction={serializedTransaction}
        accounts={serializedAccounts}
        categories={serializedCategories}
      />
    </div>
  )
}
