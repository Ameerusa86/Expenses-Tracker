'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/app/actions/transactions'
import { toast } from 'sonner'

interface Transaction {
  _id: string
  accountId: string
  categoryId?: string
  amountCents: number
  date: string
  payee?: string
  notes?: string
  status: 'cleared' | 'pending' | 'reconciled'
}

interface Account {
  _id: string
  name: string
  type: string
}

interface Category {
  _id: string
  name: string
  type: string
}

interface TransactionFormProps {
  transaction?: Transaction
  accounts: Account[]
  categories: Category[]
}

export function TransactionForm({
  transaction,
  accounts,
  categories,
}: TransactionFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isEditing = !!transaction

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      const amountValue = formData.get('amount') as string
      const isExpense = (formData.get('type') as string) === 'expense'
      const amountCents = Math.round(
        Math.abs(parseFloat(amountValue)) * 100 * (isExpense ? -1 : 1),
      )

      const data = {
        accountId: formData.get('accountId') as string,
        categoryId: (formData.get('categoryId') as string) || undefined,
        amountCents,
        date: new Date(formData.get('date') as string),
        payee: formData.get('payee') as string,
        notes: formData.get('notes') as string,
        status: formData.get('status') as 'cleared' | 'pending' | 'reconciled',
      }

      if (isEditing) {
        await updateTransaction(transaction._id, data)
        toast.success('Transaction updated successfully')
      } else {
        await createTransaction(data)
        toast.success('Transaction created successfully')
      }

      router.push('/transactions')
      router.refresh()
    } catch (error) {
      toast.error(
        isEditing
          ? 'Failed to update transaction'
          : 'Failed to create transaction',
      )
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!transaction) return
    if (!confirm('Are you sure you want to delete this transaction?')) return

    setIsDeleting(true)
    try {
      await deleteTransaction(transaction._id)
      toast.success('Transaction deleted successfully')
      router.push('/transactions')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete transaction')
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  const defaultDate = transaction?.date
    ? new Date(transaction.date).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]

  const defaultAmount = transaction?.amountCents
    ? Math.abs(transaction.amountCents / 100).toFixed(2)
    : ''

  const defaultType = transaction?.amountCents
    ? transaction.amountCents < 0
      ? 'expense'
      : 'income'
    : 'expense'

  return (
    <Card className="p-6">
      <form action={handleSubmit} className="space-y-6">
        {/* Transaction Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Transaction Type</Label>
          <select
            id="type"
            name="type"
            defaultValue={defaultType}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={defaultDate}
            required
          />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultAmount}
            placeholder="0.00"
            required
          />
        </div>

        {/* Account */}
        <div className="space-y-2">
          <Label htmlFor="accountId">Account</Label>
          <select
            id="accountId"
            name="accountId"
            defaultValue={transaction?.accountId || ''}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          >
            <option value="">Select an account</option>
            {accounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account.name} ({account.type})
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category (Optional)</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={transaction?.categoryId || ''}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Uncategorized</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name} ({category.type})
              </option>
            ))}
          </select>
        </div>

        {/* Payee */}
        <div className="space-y-2">
          <Label htmlFor="payee">Payee/Description</Label>
          <Input
            id="payee"
            name="payee"
            defaultValue={transaction?.payee || ''}
            placeholder="e.g., Grocery Store, Salary, etc."
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <textarea
            id="notes"
            name="notes"
            defaultValue={transaction?.notes || ''}
            className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Additional notes..."
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={transaction?.status || 'cleared'}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          >
            <option value="cleared">Cleared</option>
            <option value="pending">Pending</option>
            <option value="reconciled">Reconciled</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting
              ? isEditing
                ? 'Updating...'
                : 'Creating...'
              : isEditing
                ? 'Update Transaction'
                : 'Create Transaction'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting || isDeleting}
          >
            Cancel
          </Button>

          {isEditing && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}
