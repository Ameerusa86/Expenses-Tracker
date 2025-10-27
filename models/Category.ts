import { Schema, model, models, Types } from 'mongoose'

export interface CategoryDoc {
  _id: Types.ObjectId
  userId: Types.ObjectId
  name: string
  type: 'income' | 'expense' | 'transfer'
  parentId?: Types.ObjectId | null
  icon?: string
  color?: string
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<CategoryDoc>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['income', 'expense', 'transfer'],
      default: 'expense',
    },
    parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    icon: String,
    color: String,
  },
  { timestamps: true },
)

CategorySchema.index({ userId: 1, name: 1 }, { unique: true })

export const Category =
  models.Category || model<CategoryDoc>('Category', CategorySchema)
