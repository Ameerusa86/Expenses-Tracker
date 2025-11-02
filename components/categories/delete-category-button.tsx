'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { deleteCategory } from '@/app/actions/categories'

export function DeleteCategoryButton({ categoryId }: { categoryId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  function handleDelete() {
    toast('Are you sure you want to delete this category?', {
      description: 'This action cannot be undone.',
      duration: 5000,
      action: {
        label: 'Delete',
        onClick: async () => {
          setIsDeleting(true)
          try {
            await deleteCategory(categoryId)
            toast.success('Category deleted successfully')
            router.push('/categories')
            router.refresh()
          } catch (error) {
            toast.error('Failed to delete category')
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
        'Delete category'
      )}
    </Button>
  )
}
