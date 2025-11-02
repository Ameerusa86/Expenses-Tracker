'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { deleteLiability } from '@/app/actions/liabilities'

export function DeleteLiabilityButton({
  liabilityId,
}: {
  liabilityId: string
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    const confirmed = confirm(
      'Are you sure you want to delete this credit/loan? This action cannot be undone.',
    )

    if (!confirmed) return

    setIsDeleting(true)
    try {
      await deleteLiability(liabilityId)
      toast.success('Credit/Loan deleted successfully')
      router.push('/credit-loans')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete credit/loan')
      console.error(error)
      setIsDeleting(false)
    }
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Deleting...
        </>
      ) : (
        'Delete'
      )}
    </Button>
  )
}
