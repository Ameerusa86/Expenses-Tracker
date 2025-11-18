import { Schema, model, models, Types } from 'mongoose'

export interface LiabilityChargeDoc {
  _id: Types.ObjectId
  userId: Types.ObjectId
  liabilityId: Types.ObjectId
  amountCents: number // positive charge increasing balance
  date: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const LiabilityChargeSchema = new Schema<LiabilityChargeDoc>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    liabilityId: {
      type: Schema.Types.ObjectId,
      ref: 'Liability',
      required: true,
      index: true,
    },
    amountCents: { type: Number, required: true, min: 1 },
    date: { type: Date, required: true },
    notes: { type: String },
  },
  { timestamps: true },
)

LiabilityChargeSchema.index({ userId: 1, liabilityId: 1, date: -1 })

export const LiabilityCharge =
  models.LiabilityCharge ||
  model<LiabilityChargeDoc>('LiabilityCharge', LiabilityChargeSchema)
