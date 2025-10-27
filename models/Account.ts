import { Schema, model, models, Types } from 'mongoose'

export interface AccountDoc {
  _id: Types.ObjectId
  userId: Types.ObjectId // multi-tenant
  name: string
  type: 'cash' | 'bank' | 'credit' | 'investment'
  institution?: string
  currency: string // ISO-4217
  createdAt: Date
  updatedAt: Date
}

const AccountSchema = new Schema<AccountDoc>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['cash', 'bank', 'credit', 'investment'],
      required: true,
    },
    institution: { type: String },
    currency: { type: String, default: 'USD' },
  },
  { timestamps: true },
)

AccountSchema.index({ userId: 1, name: 1 }, { unique: true })

export const Account =
  models.Account || model<AccountDoc>('Account', AccountSchema)
