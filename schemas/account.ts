import { z } from 'zod'

export const accountCreateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['cash', 'bank', 'credit', 'investment']),
  institution: z.string().optional().default(''),
  currency: z.string().length(3).default('USD'),
})

export const accountUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['cash', 'bank', 'credit', 'investment']).optional(),
  institution: z.string().optional(),
  currency: z.string().length(3).optional(),
})
