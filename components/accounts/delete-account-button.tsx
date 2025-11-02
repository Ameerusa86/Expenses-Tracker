'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { deleteAccount } from '@/app/actions/accounts'

export function DeleteAccountButton({ accountId }: { accountId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  function handleDelete() {
    toast('Are you sure you want to delete this account?', {
      description: 'This action cannot be undone.',
      action: {
        label: 'Delete',
        onClick: async () => {
          setIsDeleting(true)
          try {
            await deleteAccount(accountId)
            toast.success('Account deleted successfully')
            router.push('/accounts')
            router.refresh()
          } catch (error) {
            toast.error('Failed to delete account')
            console.error(error)
            setIsDeleting(false)
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    })
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
        'Delete account'
      )}
    </Button>
  )
}
