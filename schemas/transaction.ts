import { z } from 'zod'

export const transactionCreateSchema = z.object({
  accountId: z.string().min(1),
  categoryId: z.string().optional(),
  amountCents: z.number().int(), // negative for expense, positive for income
  date: z.coerce.date(),
  payee: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  status: z.enum(['cleared', 'pending', 'reconciled']).default('cleared'),
})

export const transactionUpdateSchema = z.object({
  accountId: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  amountCents: z.number().int().optional(),
  date: z.coerce.date().optional(),
  payee: z.string().optional(),
  notes: z.string().optional().nullable(),
  status: z.enum(['cleared', 'pending', 'reconciled']).optional(),
})
