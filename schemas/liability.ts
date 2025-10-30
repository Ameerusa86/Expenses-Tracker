import { z } from 'zod'

export const liabilityCreateSchema = z.object({
  type: z.enum(['credit-card', 'loan']),
  name: z.string().min(1),
  institution: z.string().optional().default(''),
  balanceCents: z.number().int().nonnegative().default(0),
  creditLimitCents: z.number().int().nonnegative().optional(),
  interestRateAPR: z.number().nonnegative().optional(),
  minPaymentCents: z.number().int().nonnegative().optional(),
  statementDay: z.number().int().min(1).max(28).optional(),
  dueDay: z.number().int().min(1).max(28).optional(),
  nextDueDate: z.coerce.date().optional(),
  status: z.enum(['open', 'closed']).default('open'),
})

export const liabilityUpdateSchema = z.object({
  type: z.enum(['credit-card', 'loan']).optional(),
  name: z.string().min(1).optional(),
  institution: z.string().optional(),
  balanceCents: z.number().int().nonnegative().optional(),
  creditLimitCents: z.number().int().nonnegative().optional().nullable(),
  interestRateAPR: z.number().nonnegative().optional().nullable(),
  minPaymentCents: z.number().int().nonnegative().optional().nullable(),
  statementDay: z.number().int().min(1).max(28).optional().nullable(),
  dueDay: z.number().int().min(1).max(28).optional().nullable(),
  nextDueDate: z.coerce.date().optional().nullable(),
  status: z.enum(['open', 'closed']).optional(),
})
