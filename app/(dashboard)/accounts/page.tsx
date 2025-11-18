import { dbConnect } from '@/lib/db'
import { Account } from '@/models/Account'
import { Transaction } from '@/models/Transaction'
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
} from 'lucide-react'
import { Types } from 'mongoose'
import { Sparkline } from '@/components/ui/sparkline'
import { formatCurrency } from '@/utils/money'

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

  // Compute per-account balances and last 7-day series
  const ids = accounts.map((a: any) => a._id as Types.ObjectId)
  const now = new Date()
  const windowStart = new Date(now)
  windowStart.setDate(windowStart.getDate() - 6)
  windowStart.setHours(0, 0, 0, 0)

  const [balanceAgg, dailyAgg] = ids.length
    ? await Promise.all([
        Transaction.aggregate([
          {
            $match: {
              userId: new Types.ObjectId(userId),
              accountId: { $in: ids },
            },
          },
          { $group: { _id: '$accountId', total: { $sum: '$amountCents' } } },
        ]).exec(),
        Transaction.aggregate([
          {
            $match: {
              userId: new Types.ObjectId(userId),
              accountId: { $in: ids },
              date: { $gte: windowStart },
            },
          },
          {
            $addFields: {
              day: { $dateTrunc: { date: '$date', unit: 'day' } },
            },
          },
          {
            $group: {
              _id: { acc: '$accountId', d: '$day' },
              total: { $sum: '$amountCents' },
            },
          },
        ]).exec(),
      ])
    : [[], []]

  const balById = new Map<string, number>(
    (balanceAgg as Array<{ _id: Types.ObjectId; total: number }>).map((r) => [
      String(r._id),
      r.total || 0,
    ]),
  )
  const dailyMap = new Map<string, number>(
    (
      dailyAgg as Array<{
        _id: { acc: Types.ObjectId; d: Date }
        total: number
      }>
    ).map((r) => [
      `${String(r._id.acc)}|${new Date(r._id.d).toISOString()}`,
      r.total || 0,
    ]),
  )

  const days: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(windowStart)
    d.setDate(windowStart.getDate() + i)
    return d
  })

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="space-y-8 animate-in fade-in duration-500">
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
                <Card className="p-12 sm:p-16 text-center border-2 border-dashed shadow-md">
                  <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                    <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">No accounts yet</h3>
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
                  const balanceCents = balById.get(account._id) || 0
                  const netClass =
                    balanceCents >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  const series = days.map((d) => {
                    const key = `${account._id}|${new Date(d).toISOString()}`
                    return dailyMap.get(key) || 0
                  })
                  return (
                    <Card
                      key={account._id}
                      className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                    >
                      <div className="relative p-6 space-y-5">
                        {/* Header */}
                        <div className="flex items-start gap-4">
                          <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <Icon className="h-7 w-7 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold truncate text-foreground">
                              {account.name}
                            </h3>
                            {account.institution && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                <p className="text-sm text-muted-foreground truncate">
                                  {account.institution}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Balance */}
                        <div className="space-y-2">
                          <div className="flex items-baseline justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Current Balance
                            </span>
                            <span className={`text-2xl font-bold ${netClass}`}>
                              {formatCurrency(balanceCents)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary capitalize">
                              {account.type}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="font-semibold text-sm text-foreground">
                              {account.currency}
                            </span>
                          </div>
                        </div>

                        {/* Mini trend */}
                        <div className="pt-2 border-t border-border/50">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Last 7 Days Activity
                          </p>
                          <div className="flex justify-center">
                            <Sparkline
                              points={series}
                              width={160}
                              height={32}
                              className={netClass}
                            />
                          </div>
                        </div>

                        {/* Action Button */}
                        <Link
                          href={`/accounts/${account._id}`}
                          className="block pt-2"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                          >
                            View Details
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
