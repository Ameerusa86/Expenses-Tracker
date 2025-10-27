import { dbConnect } from '@/lib/db'
import { Category } from '@/models/Category'
import { getUserId } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default async function CategoriesPage() {
  await dbConnect()
  const userId = await getUserId()

  const categories = await Category.find({ userId }).sort({ name: 1 }).lean()
  const serializedCategories = JSON.parse(JSON.stringify(categories))

  // Group by type
  const income = serializedCategories.filter(
    (c: { type: string }) => c.type === 'income',
  )
  const expense = serializedCategories.filter(
    (c: { type: string }) => c.type === 'expense',
  )
  const transfer = serializedCategories.filter(
    (c: { type: string }) => c.type === 'transfer',
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Organize your transactions with categories
          </p>
        </div>
        <Link href="/categories/new">
          <Button>Add Category</Button>
        </Link>
      </div>

      {serializedCategories.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No categories yet. Click &quot;Add Category&quot; to get started.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Income Categories */}
          {income.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-green-600">Income</h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {income.map(
                  (category: {
                    _id: string
                    name: string
                    icon?: string
                    color?: string
                  }) => (
                    <Card key={category._id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {category.icon && (
                            <span className="text-lg">{category.icon}</span>
                          )}
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <Link href={`/categories/${category._id}`}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Expense Categories */}
          {expense.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-red-600">Expense</h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {expense.map(
                  (category: {
                    _id: string
                    name: string
                    icon?: string
                    color?: string
                  }) => (
                    <Card key={category._id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {category.icon && (
                            <span className="text-lg">{category.icon}</span>
                          )}
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <Link href={`/categories/${category._id}`}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Transfer Categories */}
          {transfer.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-blue-600">Transfer</h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {transfer.map(
                  (category: {
                    _id: string
                    name: string
                    icon?: string
                    color?: string
                  }) => (
                    <Card key={category._id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {category.icon && (
                            <span className="text-lg">{category.icon}</span>
                          )}
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <Link href={`/categories/${category._id}`}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
