import { dbConnect } from '@/lib/db'
import { Category } from '@/models/Category'
import { getUserId } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { updateCategory, deleteCategory } from '@/app/actions/categories'
import { ArrowLeft } from 'lucide-react'

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await dbConnect()
  const userId = await getUserId()

  const category = await Category.findOne({ _id: id, userId }).lean()
  if (!category) {
    notFound()
  }

  async function updateAction(formData: FormData) {
    'use server'
    const input = {
      name: String(formData.get('name') || ''),
      type: String(formData.get('type') || 'expense') as
        | 'income'
        | 'expense'
        | 'transfer',
      icon: String(formData.get('icon') || ''),
      color: String(formData.get('color') || ''),
    }
    await updateCategory(id, input)
    redirect('/categories')
  }

  async function deleteAction() {
    'use server'
    await deleteCategory(id)
    redirect('/categories')
  }

  const typed = category as unknown as {
    _id: string
    name: string
    type: 'income' | 'expense' | 'transfer'
    icon?: string
    color?: string
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/categories"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Categories</span>
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground font-medium">Edit Category</span>
          </nav>

          {/* Header Section */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Edit Category
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Update category details or delete this category.
            </p>
          </div>

          <Card className="p-6 sm:p-8">
            <form action={updateAction} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Category name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={typed.name}
                  placeholder="e.g. Groceries, Salary, etc."
                  required
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Category type</Label>
                <select
                  id="type"
                  name="type"
                  defaultValue={typed.type}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>

              {/* Icon */}
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (emoji)</Label>
                <Input
                  id="icon"
                  name="icon"
                  defaultValue={typed.icon || ''}
                  placeholder="e.g. 🛒, 💰, 🏠"
                  maxLength={2}
                />
                <p className="text-xs text-muted-foreground">
                  Use any emoji as an icon for this category
                </p>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="color">Color (optional)</Label>
                <div className="flex gap-3 items-center">
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    defaultValue={typed.color || '#3b82f6'}
                    className="h-10 w-20 cursor-pointer"
                  />
                  <Input
                    type="text"
                    defaultValue={typed.color || '#3b82f6'}
                    placeholder="#3b82f6"
                    className="flex-1"
                    onChange={(e) => {
                      const colorInput = document.getElementById(
                        'color',
                      ) as HTMLInputElement
                      if (
                        colorInput &&
                        /^#[0-9A-F]{6}$/i.test(e.target.value)
                      ) {
                        colorInput.value = e.target.value
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose a color to help identify this category
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                <Button type="submit" className="w-full sm:flex-1">
                  Save changes
                </Button>
                <Link href="/categories" className="w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-destructive">
                  Danger Zone
                </h3>
                <p className="text-sm text-muted-foreground">
                  Deleting this category will remove it permanently. This action
                  cannot be undone.
                </p>
                <form action={deleteAction}>
                  <Button type="submit" variant="destructive" size="sm">
                    Delete category
                  </Button>
                </form>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
