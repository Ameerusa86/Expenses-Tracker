import { z } from 'zod'

export const recurringIncomeCreateSchema = z.object({
  name: z.string().min(1),
  amountCents: z.number().int().positive(),
  frequency: z.literal('bi-weekly'),
  startDate: z.coerce.date(),
})

export const recurringIncomeUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  amountCents: z.number().int().positive().optional(),
  frequency: z.literal('bi-weekly').optional(),
  startDate: z.coerce.date().optional(),
})
