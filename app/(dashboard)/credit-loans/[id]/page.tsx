import { dbConnect } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import { Liability } from '@/models/Liability'
import { LiabilityPayment } from '@/models/LiabilityPayment'
import { LiabilityCharge } from '@/models/LiabilityCharge'
import { Card } from '@/components/ui/card'
import { AddCreditLoanPaymentModal } from '@/components/credit-loans/add-payment-modal'
import { AddCreditLoanChargeModal } from '@/components/credit-loans/add-charge-modal'
import { CreditCard, Landmark, CalendarDays } from 'lucide-react'
import { formatCurrency } from '@/utils/money'
import { Types } from 'mongoose'

export default async function CreditLoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await dbConnect()
  const userId = await getUserId()
  const { id } = await params
  const _id = new Types.ObjectId(id)

  const [liabilityDoc, paymentsDocs, chargesDocs] = await Promise.all([
    Liability.findOne({ _id, userId }).lean(),
    LiabilityPayment.find({ liabilityId: _id, userId })
      .sort({ date: -1 })
      .lean(),
    LiabilityCharge.find({ liabilityId: _id, userId })
      .sort({ date: -1 })
      .lean(),
  ])

  if (!liabilityDoc) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <p className="text-muted-foreground">Item not found.</p>
      </div>
    )
  }

  const liability = JSON.parse(JSON.stringify(liabilityDoc)) as {
    _id: string
    type: 'credit-card' | 'loan'
    name: string
    institution?: string
    balanceCents: number
    creditLimitCents?: number
    minPaymentCents?: number
  }
  const payments = JSON.parse(JSON.stringify(paymentsDocs)) as Array<{
    _id: string
    amountCents: number
    date: string
    notes?: string
  }>
  const charges = JSON.parse(JSON.stringify(chargesDocs)) as Array<{
    _id: string
    amountCents: number
    date: string
    notes?: string
  }>

  const Icon = liability.type === 'credit-card' ? CreditCard : Landmark

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="space-y-8 animate-in fade-in duration-500">
          <Card className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {liability.name}
                  </h1>
                  <div className="text-sm text-muted-foreground mt-1 capitalize">
                    {liability.type.replace('-', ' ')}
                  </div>
                </div>
              </div>
              <div className="shrink-0 flex gap-2">
                <AddCreditLoanChargeModal liabilityId={liability._id} />
                <AddCreditLoanPaymentModal liabilityId={liability._id} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">
                  Current Balance
                </div>
                <div className="text-2xl font-semibold">
                  {formatCurrency(liability.balanceCents)}
                </div>
              </div>
              {liability.creditLimitCents != null && (
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">
                    Credit Limit
                  </div>
                  <div className="text-2xl font-semibold">
                    {formatCurrency(liability.creditLimitCents)}
                  </div>
                </div>
              )}
              {liability.minPaymentCents != null && (
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">
                    Min Payment
                  </div>
                  <div className="text-2xl font-semibold">
                    {formatCurrency(liability.minPaymentCents)}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  Charges
                </h2>
                {charges.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground">
                    No charges recorded.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {charges.map((c) => (
                      <div
                        key={c._id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <div className="font-medium">
                            {formatCurrency(c.amountCents)}
                          </div>
                          {c.notes && (
                            <div className="text-sm text-muted-foreground mt-0.5">
                              {c.notes}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(c.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  Payments
                </h2>
                {payments.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground">
                    No payments yet. Log your first payment to begin.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((p) => (
                      <div
                        key={p._id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <div className="font-medium">
                            {formatCurrency(p.amountCents)}
                          </div>
                          {p.notes && (
                            <div className="text-sm text-muted-foreground mt-0.5">
                              {p.notes}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(p.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
