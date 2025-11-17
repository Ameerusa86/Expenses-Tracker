import { z } from 'zod'

export const generatePlanSchema = z.object({
  paycheckAmountCents: z.number().int().positive(),
  payDate: z.coerce.date(),
  strategy: z.enum(['avalanche', 'snowball']).default('avalanche'),
  reserveCents: z.number().int().nonnegative().default(0),
  targetUtilizationPercent: z.number().min(0).max(100).optional(),
})

export const applyPlanSchema = z.object({
  payDate: z.coerce.date(),
  allocations: z
    .array(
      z.object({
        liabilityId: z.string().min(1),
        amountCents: z.number().int().positive(),
        dueDate: z.coerce.date().optional(),
      }),
    )
    .min(1),
})
