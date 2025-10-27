import { createCategory } from '@/app/actions/categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default function NewCategoryPage() {
  async function action(formData: FormData) {
    'use server'
    await createCategory({
      name: String(formData.get('name')),
      type: String(formData.get('type')),
      icon: String(formData.get('icon') || ''),
      color: String(formData.get('color') || ''),
    })
    redirect('/categories')
  }

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">New Category</h1>
        <p className="text-muted-foreground">
          Create a new category for transactions
        </p>
      </div>

      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name</Label>
          <Input id="name" name="name" required placeholder="e.g., Groceries" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon">Icon (Optional)</Label>
          <Input
            id="icon"
            name="icon"
            placeholder="e.g., 🍔, 💰, 🏠"
            maxLength={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color (Optional)</Label>
          <Input id="color" name="color" type="color" placeholder="#000000" />
        </div>

        <div className="flex gap-3">
          <Button type="submit" className="flex-1">
            Create Category
          </Button>
          <Link href="/categories">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
