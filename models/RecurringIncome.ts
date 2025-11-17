import { Schema, model, models, Types } from 'mongoose'

export type IncomeFrequency = 'bi-weekly'

export interface RecurringIncomeDoc {
  _id: Types.ObjectId
  userId: Types.ObjectId
  name: string
  amountCents: number
  frequency: IncomeFrequency
  startDate: Date
  createdAt: Date
  updatedAt: Date
}

const RecurringIncomeSchema = new Schema<RecurringIncomeDoc>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true },
    amountCents: { type: Number, required: true, min: 1 },
    frequency: { type: String, enum: ['bi-weekly'], required: true },
    startDate: { type: Date, required: true },
  },
  { timestamps: true },
)

RecurringIncomeSchema.index({ userId: 1, name: 1 })

export const RecurringIncome =
  models.RecurringIncome ||
  model<RecurringIncomeDoc>('RecurringIncome', RecurringIncomeSchema)
