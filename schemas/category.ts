import { z } from 'zod'

export const categoryCreateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['income', 'expense', 'transfer']).default('expense'),
  parentId: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
})

export const categoryUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['income', 'expense', 'transfer']).optional(),
  parentId: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
})
