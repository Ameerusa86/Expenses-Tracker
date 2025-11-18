import { dbConnect } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import { Liability } from '@/models/Liability'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AddCreditLoanModal } from '@/components/credit-loans/add-credit-loan-modal'
import { CreditLoansQuickAdd } from '@/components/credit-loans/quick-add'
import { CreditLoansRangePicker } from '@/components/credit-loans/range-picker'
import {
  Building2,
  CreditCard,
  Landmark,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { formatCurrency } from '@/utils/money'
import { LiabilityPayment } from '@/models/LiabilityPayment'
import { LiabilityCharge } from '@/models/LiabilityCharge'
import { Types } from 'mongoose'
import { Sparkline } from '@/components/ui/sparkline'

export default async function CreditLoansPage({
  searchParams,
}: {
  searchParams?: { range?: string }
}) {
  await dbConnect()
  const userId = await getUserId()
  const range =
    searchParams?.range === 'this-month' || searchParams?.range === 'all'
      ? (searchParams?.range as 'this-month' | 'all')
      : searchParams?.range === 'last-month'
        ? 'last-month'
        : '30d'

  const items = await Liability.find({ userId }).sort({ updatedAt: -1 }).lean()
  const liabilities = JSON.parse(JSON.stringify(items)) as Array<{
    _id: string
    type: 'credit-card' | 'loan'
    name: string
    institution?: string
    balanceCents: number
    creditLimitCents?: number
  }>

  // Compute aggregation window
  let since: Date | null = null
  let until: Date | null = null
  if (range === '30d') {
    since = new Date()
    since.setDate(since.getDate() - 30)
    until = null
  } else if (range === 'this-month') {
    const now = new Date()
    since = new Date(now.getFullYear(), now.getMonth(), 1)
    until = null
  } else if (range === 'last-month') {
    const now = new Date()
    const firstThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    since = new Date(
      firstThisMonth.getFullYear(),
      firstThisMonth.getMonth() - 1,
      1,
    )
    until = firstThisMonth
  } else {
    since = null
    until = null
  }

  // Aggregate per-liability totals
  const ids = liabilities.map((l) => new Types.ObjectId(l._id))
  const dateMatch = since
    ? until
      ? { date: { $gte: since, $lt: until } }
      : { date: { $gte: since } }
    : {}

  const [payAgg, chgAgg] = ids.length
    ? await Promise.all([
        LiabilityPayment.aggregate([
          {
            $match: {
              userId: new Types.ObjectId(userId),
              liabilityId: { $in: ids },
              ...dateMatch,
            },
          },
          { $group: { _id: '$liabilityId', total: { $sum: '$amountCents' } } },
        ]).exec(),
        LiabilityCharge.aggregate([
          {
            $match: {
              userId: new Types.ObjectId(userId),
              liabilityId: { $in: ids },
              ...dateMatch,
            },
          },
          { $group: { _id: '$liabilityId', total: { $sum: '$amountCents' } } },
        ]).exec(),
      ])
    : [[], []]

  const payById = new Map<string, number>(
    (payAgg as Array<{ _id: Types.ObjectId; total: number }>).map((r) => [
      String(r._id),
      r.total || 0,
    ]),
  )
  const chgById = new Map<string, number>(
    (chgAgg as Array<{ _id: Types.ObjectId; total: number }>).map((r) => [
      String(r._id),
      r.total || 0,
    ]),
  )

  const rangeLabel =
    range === 'this-month'
      ? 'This month'
      : range === 'last-month'
        ? 'Last month'
        : range === 'all'
          ? 'All time'
          : 'Last 30 days'

  // Build weekly series for sparkline over ~6 weeks or selected month window
  const seriesStart = (() => {
    const now = new Date()
    if (range === 'last-month') {
      const firstThis = new Date(now.getFullYear(), now.getMonth(), 1)
      return new Date(firstThis.getFullYear(), firstThis.getMonth() - 1, 1)
    }
    if (range === 'this-month')
      return new Date(now.getFullYear(), now.getMonth(), 1)
    const d = new Date()
    d.setDate(d.getDate() - 42)
    return d
  })()

  const [paySeriesAgg, chgSeriesAgg] = ids.length
    ? await Promise.all([
        LiabilityPayment.aggregate([
          {
            $match: {
              userId: new Types.ObjectId(userId),
              liabilityId: { $in: ids },
              date: { $gte: seriesStart },
            },
          },
          {
            $addFields: {
              bucket: { $dateTrunc: { date: '$date', unit: 'week' } },
            },
          },
          {
            $group: {
              _id: { lid: '$liabilityId', b: '$bucket' },
              total: { $sum: '$amountCents' },
            },
          },
        ]).exec(),
        LiabilityCharge.aggregate([
          {
            $match: {
              userId: new Types.ObjectId(userId),
              liabilityId: { $in: ids },
              date: { $gte: seriesStart },
            },
          },
          {
            $addFields: {
              bucket: { $dateTrunc: { date: '$date', unit: 'week' } },
            },
          },
          {
            $group: {
              _id: { lid: '$liabilityId', b: '$bucket' },
              total: { $sum: '$amountCents' },
            },
          },
        ]).exec(),
      ])
    : [[], []]

  const toKey = (lid: string, d: Date) => `${lid}|${new Date(d).toISOString()}`
  const paySeriesMap = new Map<string, number>(
    (
      paySeriesAgg as Array<{
        _id: { lid: Types.ObjectId; b: Date }
        total: number
      }>
    ).map((r) => [toKey(String(r._id.lid), r._id.b), r.total || 0]),
  )
  const chgSeriesMap = new Map<string, number>(
    (
      chgSeriesAgg as Array<{
        _id: { lid: Types.ObjectId; b: Date }
        total: number
      }>
    ).map((r) => [toKey(String(r._id.lid), r._id.b), r.total || 0]),
  )

  const buckets: Date[] = (() => {
    const out: Date[] = []
    const start = new Date(seriesStart)
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - start.getDay()) // week start
    for (let i = 0; i < 6; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i * 7)
      out.push(d)
    }
    return out
  })()

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

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              {liabilities.length > 0 ? (
                <CreditLoansQuickAdd
                  items={liabilities.map((l) => ({ id: l._id, name: l.name }))}
                />
              ) : (
                <div />
              )}
              <CreditLoansRangePicker />
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {liabilities.length === 0 ? (
                <div className="col-span-full">
                  <Card className="p-12 sm:p-16 text-center border-2 border-dashed">
                    <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                      <div className="h-20 w-20 rounded-md bg-primary/10 flex items-center justify-center">
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
                  const net =
                    (chgById.get(l._id) || 0) - (payById.get(l._id) || 0)
                  const netClass =
                    net === 0
                      ? 'text-muted-foreground'
                      : net > 0
                        ? 'text-rose-600'
                        : 'text-emerald-600'
                  const series = buckets.map((b) => {
                    const key = `${l._id}|${new Date(b).toISOString()}`
                    const charges = chgSeriesMap.get(key) || 0
                    const payments = paySeriesMap.get(key) || 0
                    return charges - payments
                  })

                  // Calculate utilization for credit cards
                  const hasLimit =
                    l.type === 'credit-card' &&
                    l.creditLimitCents != null &&
                    l.creditLimitCents > 0
                  const utilization = hasLimit
                    ? Math.min(
                        100,
                        Math.max(
                          0,
                          (l.balanceCents / l.creditLimitCents!) * 100,
                        ),
                      )
                    : 0
                  const utilizationVariant =
                    utilization >= 90
                      ? 'destructive'
                      : utilization >= 70
                        ? 'warning'
                        : 'success'

                  return (
                    <Card
                      key={l._id}
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
                              {l.name}
                            </h3>
                            {l.institution && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                <p className="text-sm text-muted-foreground truncate">
                                  {l.institution}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Balance & Type */}
                        <div className="space-y-3">
                          <div className="flex items-baseline justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Current Balance
                            </span>
                            <span className="text-2xl font-bold text-foreground">
                              {formatCurrency(l.balanceCents)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary capitalize">
                              {l.type.replace('-', ' ')}
                            </span>
                            {hasLimit && (
                              <span className="text-xs text-muted-foreground">
                                Limit: {formatCurrency(l.creditLimitCents!)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Utilization Bar (Credit Cards Only) */}
                        {hasLimit && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-muted-foreground">
                                Credit Utilization
                              </span>
                              <span
                                className={`font-bold ${
                                  utilization >= 90
                                    ? 'text-rose-600'
                                    : utilization >= 70
                                      ? 'text-amber-600'
                                      : 'text-emerald-600'
                                }`}
                              >
                                {utilization.toFixed(1)}%
                              </span>
                            </div>
                            <Progress
                              value={utilization}
                              variant={utilizationVariant}
                              className="h-2.5"
                            />
                          </div>
                        )}

                        {/* Activity Summary */}
                        <div className="space-y-2 pt-2 border-t border-border/50">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Net Activity ({rangeLabel})
                            </span>
                            <span
                              className={`font-semibold flex items-center gap-1 ${netClass}`}
                            >
                              {net > 0 ? (
                                <TrendingUp className="h-3.5 w-3.5" />
                              ) : net < 0 ? (
                                <TrendingDown className="h-3.5 w-3.5" />
                              ) : null}
                              {formatCurrency(Math.abs(net))}
                            </span>
                          </div>
                          <div className="flex justify-center pt-1">
                            <Sparkline
                              points={series}
                              width={180}
                              height={32}
                              className={netClass}
                            />
                          </div>
                        </div>

                        {/* Action Button */}
                        <Link
                          href={`/credit-loans/${l._id}`}
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
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
