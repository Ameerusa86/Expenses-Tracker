import { Schema, model, models, Types } from 'mongoose'

export type LiabilityType = 'credit-card' | 'loan'
export type LiabilityStatus = 'open' | 'closed'

export interface LiabilityDoc {
  _id: Types.ObjectId
  userId: Types.ObjectId
  type: LiabilityType
  name: string
  institution?: string
  balanceCents: number // amount owed, >= 0
  creditLimitCents?: number // credit cards only
  interestRateAPR?: number // e.g., 19.99
  minPaymentCents?: number
  targetUtilizationPercent?: number // optional per-card goal, e.g., 30
  statementDay?: number // 1-28 (credit cards)
  dueDay?: number // 1-28 (credit cards)
  nextDueDate?: Date // explicit next due date (loans)
  lastPaymentDate?: Date
  status: LiabilityStatus
  createdAt: Date
  updatedAt: Date
}

const LiabilitySchema = new Schema<LiabilityDoc>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    type: { type: String, enum: ['credit-card', 'loan'], required: true },
    name: { type: String, required: true },
    institution: { type: String },
    balanceCents: { type: Number, required: true, default: 0 },
    creditLimitCents: { type: Number },
    interestRateAPR: { type: Number },
    minPaymentCents: { type: Number },
    targetUtilizationPercent: { type: Number, min: 0, max: 100 },
    statementDay: { type: Number, min: 1, max: 28 },
    dueDay: { type: Number, min: 1, max: 28 },
    nextDueDate: { type: Date },
    lastPaymentDate: { type: Date },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
  },
  { timestamps: true },
)

LiabilitySchema.index({ userId: 1, name: 1 }, { unique: true })
LiabilitySchema.index({ userId: 1, type: 1 })

export const Liability =
  models.Liability || model<LiabilityDoc>('Liability', LiabilitySchema)
