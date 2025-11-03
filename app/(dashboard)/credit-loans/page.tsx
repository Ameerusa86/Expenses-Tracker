import { dbConnect } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import { Liability } from '@/models/Liability'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AddCreditLoanModal } from '@/components/credit-loans/add-credit-loan-modal'
import { Building2, CreditCard, Landmark, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/utils/money'

export default async function CreditLoansPage() {
  await dbConnect()
  const userId = await getUserId()
  const items = await Liability.find({ userId }).sort({ updatedAt: -1 }).lean()
  const liabilities = JSON.parse(JSON.stringify(items)) as Array<{
    _id: string
    type: 'credit-card' | 'loan'
    name: string
    institution?: string
    balanceCents: number
    creditLimitCents?: number
  }>

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Credit & Loans
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Track credit cards and loans, balances, and payments
              </p>
            </div>
            <div className="shrink-0">
              <AddCreditLoanModal />
            </div>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {liabilities.length === 0 ? (
              <div className="col-span-full">
                <Card className="p-12 sm:p-16 text-center border-2 border-dashed">
                  <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                    <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Landmark className="h-10 w-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">
                        No credit/loans yet
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Add your first credit card or loan to start tracking
                        balances and payments
                      </p>
                    </div>
                    <AddCreditLoanModal />
                  </div>
                </Card>
              </div>
            ) : (
              liabilities.map((l) => {
                const Icon = l.type === 'credit-card' ? CreditCard : Landmark
                const limitText =
                  l.type === 'credit-card' && l.creditLimitCents != null
                    ? ` • Limit ${formatCurrency(l.creditLimitCents)}`
                    : ''
                return (
                  <Card
                    key={l._id}
                    className="group relative overflow-hidden transition-all duration-300 hover:shadow-elevated"
                  >
                    <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative p-5 sm:p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold truncate">
                            {l.name}
                          </h3>
                          {l.institution && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <p className="text-sm text-muted-foreground truncate">
                                {l.institution}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                          {l.type.replace('-', ' ')}
                        </span>
                        <span className="text-muted-foreground"> • </span>
                        <span className="font-semibold">
                          Balance {formatCurrency(l.balanceCents)}
                        </span>
                        <span className="text-muted-foreground">
                          {limitText}
                        </span>
                      </div>

                      <Link href={`/credit-loans/${l._id}`} className="block">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-between group-hover:bg-primary/10 transition-colors"
                        >
                          View Details
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
