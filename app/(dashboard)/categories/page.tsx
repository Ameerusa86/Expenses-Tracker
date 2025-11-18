import { dbConnect } from '@/lib/db'
import { Category } from '@/models/Category'
import { getUserId } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { AddCategoryModal } from '@/components/categories/add-category-modal'
import { Receipt, Wallet, Tags, ArrowRight } from 'lucide-react'

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
            <Card className="p-12 sm:p-16 text-center border-2 border-dashed shadow-md">
              <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Tags className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">No categories yet</h3>
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
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/30">
                      <span className="text-2xl" role="img" aria-label="income">
                        💰
                      </span>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Income Categories
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
                          className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                        >
                          <div className="relative p-6 space-y-4">
                            <div className="flex items-center gap-3">
                              {category.icon && (
                                <span className="text-3xl" role="img">
                                  {category.icon}
                                </span>
                              )}
                              <span className="font-bold text-lg text-foreground">
                                {category.name}
                              </span>
                            </div>
                            <Link href={`/categories/${category._id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between group-hover:bg-emerald-500/10 group-hover:text-emerald-600 transition-colors"
                              >
                                Edit Category
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/30">
                      <span
                        className="text-2xl"
                        role="img"
                        aria-label="expense"
                      >
                        💸
                      </span>
                    </span>
                    <span className="text-rose-600 dark:text-rose-400">
                      Expense Categories
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
                          className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                        >
                          <div className="relative p-6 space-y-4">
                            <div className="flex items-center gap-3">
                              {category.icon && (
                                <span className="text-3xl" role="img">
                                  {category.icon}
                                </span>
                              )}
                              <span className="font-bold text-lg text-foreground">
                                {category.name}
                              </span>
                            </div>
                            <Link href={`/categories/${category._id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between group-hover:bg-rose-500/10 group-hover:text-rose-600 transition-colors"
                              >
                                Edit Category
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-950/30">
                      <span
                        className="text-2xl"
                        role="img"
                        aria-label="transfer"
                      >
                        🔄
                      </span>
                    </span>
                    <span className="text-cyan-600 dark:text-cyan-400">
                      Transfer Categories
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
                          className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                        >
                          <div className="relative p-6 space-y-4">
                            <div className="flex items-center gap-3">
                              {category.icon && (
                                <span className="text-3xl" role="img">
                                  {category.icon}
                                </span>
                              )}
                              <span className="font-bold text-lg text-foreground">
                                {category.name}
                              </span>
                            </div>
                            <Link href={`/categories/${category._id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                              >
                                Edit Category
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
