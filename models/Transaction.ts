import { Schema, model, models, Types } from 'mongoose'

export interface TransactionDoc {
  _id: Types.ObjectId
  userId: Types.ObjectId
  accountId: Types.ObjectId
  categoryId?: Types.ObjectId | null
  amountCents: number // negative expense, positive income
  date: Date
  payee?: string
  notes?: string
  status: 'cleared' | 'pending' | 'reconciled'
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema = new Schema<TransactionDoc>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    amountCents: { type: Number, required: true },
    date: { type: Date, required: true },
    payee: { type: String },
    notes: { type: String },
    status: {
      type: String,
      enum: ['cleared', 'pending', 'reconciled'],
      default: 'cleared',
    },
  },
  { timestamps: true },
)

TransactionSchema.index({ userId: 1, date: -1 })
TransactionSchema.index({ userId: 1, accountId: 1, date: -1 })

export const Transaction =
  models.Transaction || model<TransactionDoc>('Transaction', TransactionSchema)
