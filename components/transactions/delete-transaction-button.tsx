'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { deleteTransaction } from '@/app/actions/transactions'

export function DeleteTransactionButton({
  transactionId,
}: {
  transactionId: string
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    const confirmed = confirm(
      'Are you sure you want to delete this transaction? This action cannot be undone.',
    )

    if (!confirmed) return

    setIsDeleting(true)
    try {
      await deleteTransaction(transactionId)
      toast.success('Transaction deleted successfully')
      router.push('/transactions')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete transaction')
      console.error(error)
      setIsDeleting(false)
    }
  }

  return (
    <Button
      type="button"
      variant="destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Deleting...
        </>
      ) : (
        'Delete transaction'
      )}
    </Button>
  )
}
