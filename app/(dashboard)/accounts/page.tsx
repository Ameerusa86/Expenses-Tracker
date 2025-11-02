import { dbConnect } from '@/lib/db'
import { Account } from '@/models/Account'
import { getUserId } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { AddAccountModal } from '@/components/accounts/add-account-modal'
import {
  CreditCard,
  Wallet,
  TrendingUp,
  Building2,
  PiggyBank,
  ArrowRight,
  Receipt,
  Tags,
  ArrowLeft,
} from 'lucide-react'

const accountIcons = {
  checking: CreditCard,
  savings: PiggyBank,
  credit: CreditCard,
  investment: TrendingUp,
  cash: Wallet,
}

export default async function AccountsPage() {
  await dbConnect()
  const userId = await getUserId()

  const accounts = await Account.find({ userId }).sort({ name: 1 }).lean()
  const serializedAccounts = JSON.parse(JSON.stringify(accounts))

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
            <span className="text-foreground font-medium">Accounts</span>
          </nav>

          {/* Header Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Accounts
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  Manage your financial accounts and track balances across all
                  your institutions
                </p>
              </div>
              <div className="shrink-0">
                <AddAccountModal />
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
              <Link href="/categories">
                <Button variant="outline" size="sm" className="gap-2 h-9">
                  <Tags className="h-4 w-4" />
                  <span className="hidden xs:inline">Manage Categories</span>
                  <span className="xs:hidden">Categories</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Accounts Grid */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {serializedAccounts.length === 0 ? (
              <div className="col-span-full">
                <Card className="p-12 sm:p-16 text-center border-2 border-dashed">
                  <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                    <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">No accounts yet</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Create your first account to start tracking your
                        finances and managing transactions
                      </p>
                    </div>
                    <AddAccountModal />
                  </div>
                </Card>
              </div>
            ) : (
              serializedAccounts.map(
                (account: {
                  _id: string
                  name: string
                  type: string
                  institution?: string
                  currency: string
                }) => {
                  const Icon =
                    accountIcons[account.type as keyof typeof accountIcons] ||
                    Wallet
                  return (
                    <Card
                      key={account._id}
                      className="group relative overflow-hidden transition-all duration-300 hover:shadow-elevated"
                    >
                      {/* Gradient Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      <div className="relative p-5 sm:p-6 space-y-4">
                        {/* Header */}
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold truncate">
                              {account.name}
                            </h3>
                            {account.institution && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <p className="text-sm text-muted-foreground truncate">
                                  {account.institution}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                            {account.type}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="font-semibold">
                            {account.currency}
                          </span>
                        </div>

                        {/* Action Button */}
                        <Link
                          href={`/accounts/${account._id}`}
                          className="block"
                        >
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
                },
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
