import { dbConnect } from '@/lib/db'
import { Category } from '@/models/Category'
import { getUserId } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { AddCategoryModal } from '@/components/categories/add-category-modal'
import { Receipt, Wallet, ArrowLeft, Tags, ArrowRight } from 'lucide-react'

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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground font-medium">Categories</span>
          </nav>

          {/* Header Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Categories
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  Organize and manage your transaction categories
                </p>
              </div>
              <div className="shrink-0">
                <AddCategoryModal />
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-2">
              <Link href="/transactions">
                <Button variant="outline" size="sm" className="gap-2 h-9">
                  <Receipt className="h-4 w-4" />
                  <span className="hidden xs:inline">View Transactions</span>
                  <span className="xs:hidden">Transactions</span>
                </Button>
              </Link>
              <Link href="/accounts">
                <Button variant="outline" size="sm" className="gap-2 h-9">
                  <Wallet className="h-4 w-4" />
                  <span className="hidden xs:inline">Manage Accounts</span>
                  <span className="xs:hidden">Accounts</span>
                </Button>
              </Link>
            </div>
          </div>

          {serializedCategories.length === 0 ? (
            <Card className="p-12 sm:p-16 text-center border-2 border-dashed">
              <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Tags className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No categories yet</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Click &quot;Add Category&quot; to get started
                  </p>
                </div>
                <AddCategoryModal />
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Income Categories */}
              {income.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950">
                      <span className="text-green-600 dark:text-green-400">
                        💰
                      </span>
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      Income
                    </span>
                  </h2>
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                    {income.map(
                      (category: {
                        _id: string
                        name: string
                        icon?: string
                        color?: string
                      }) => (
                        <Card
                          key={category._id}
                          className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          <div className="relative p-5 sm:p-6 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {category.icon && (
                                  <span className="text-2xl">
                                    {category.icon}
                                  </span>
                                )}
                                <span className="font-semibold text-lg">
                                  {category.name}
                                </span>
                              </div>
                            </div>
                            <Link href={`/categories/${category._id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between group-hover:bg-green-500/10 transition-colors"
                              >
                                Edit Category
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
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
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950">
                      <span className="text-red-600 dark:text-red-400">💸</span>
                    </span>
                    <span className="text-red-600 dark:text-red-400">
                      Expense
                    </span>
                  </h2>
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                    {expense.map(
                      (category: {
                        _id: string
                        name: string
                        icon?: string
                        color?: string
                      }) => (
                        <Card
                          key={category._id}
                          className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          <div className="relative p-5 sm:p-6 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {category.icon && (
                                  <span className="text-2xl">
                                    {category.icon}
                                  </span>
                                )}
                                <span className="font-semibold text-lg">
                                  {category.name}
                                </span>
                              </div>
                            </div>
                            <Link href={`/categories/${category._id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between group-hover:bg-red-500/10 transition-colors"
                              >
                                Edit Category
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
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
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                      <span className="text-blue-600 dark:text-blue-400">
                        🔄
                      </span>
                    </span>
                    <span className="text-blue-600 dark:text-blue-400">
                      Transfer
                    </span>
                  </h2>
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                    {transfer.map(
                      (category: {
                        _id: string
                        name: string
                        icon?: string
                        color?: string
                      }) => (
                        <Card
                          key={category._id}
                          className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          <div className="relative p-5 sm:p-6 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {category.icon && (
                                  <span className="text-2xl">
                                    {category.icon}
                                  </span>
                                )}
                                <span className="font-semibold text-lg">
                                  {category.name}
                                </span>
                              </div>
                            </div>
                            <Link href={`/categories/${category._id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between group-hover:bg-blue-500/10 transition-colors"
                              >
                                Edit Category
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
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
      </div>
    </div>
  )
}
