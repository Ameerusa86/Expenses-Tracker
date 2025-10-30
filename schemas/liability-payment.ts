import { z } from 'zod'

export const liabilityPaymentCreateSchema = z.object({
  liabilityId: z.string().min(1),
  amountCents: z.number().int().positive(),
  date: z.coerce.date(),
  notes: z.string().optional().default(''),
})

export const liabilityPaymentUpdateSchema = z.object({
  amountCents: z.number().int().positive().optional(),
  date: z.coerce.date().optional(),
  notes: z.string().optional().nullable(),
})
