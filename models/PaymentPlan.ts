import { Schema, model, models, Types } from 'mongoose'

export type PaymentStrategy = 'avalanche' | 'snowball'
export type PaymentPlanStatus = 'draft' | 'applied'

export interface PaymentAllocation {
  liabilityId: Types.ObjectId
  amountCents: number
  dueDate?: Date
}

export interface PaymentPlanDoc {
  _id: Types.ObjectId
  userId: Types.ObjectId
  strategy: PaymentStrategy
  paycheckAmountCents: number
  payDate: Date
  reserveCents?: number
  allocations: PaymentAllocation[]
  status: PaymentPlanStatus
  createdAt: Date
  updatedAt: Date
}

const PaymentAllocationSchema = new Schema<PaymentAllocation>(
  {
    liabilityId: {
      type: Schema.Types.ObjectId,
      ref: 'Liability',
      required: true,
    },
    amountCents: { type: Number, required: true, min: 1 },
    dueDate: { type: Date },
  },
  { _id: false },
)

const PaymentPlanSchema = new Schema<PaymentPlanDoc>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    strategy: { type: String, enum: ['avalanche', 'snowball'], required: true },
    paycheckAmountCents: { type: Number, required: true, min: 1 },
    payDate: { type: Date, required: true },
    reserveCents: { type: Number, default: 0 },
    allocations: { type: [PaymentAllocationSchema], default: [] },
    status: { type: String, enum: ['draft', 'applied'], default: 'draft' },
  },
  { timestamps: true },
)

PaymentPlanSchema.index({ userId: 1, payDate: -1 })

export const PaymentPlan =
  models.PaymentPlan || model<PaymentPlanDoc>('PaymentPlan', PaymentPlanSchema)
