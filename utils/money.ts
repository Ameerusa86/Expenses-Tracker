export function toCents(input: number | string) {
  const n = typeof input === 'string' ? Number(input) : input
  return Math.round(n * 100)
}

export function fromCents(cents: number) {
  return (cents ?? 0) / 100
}

/**
 * Format cents to currency string
 * @param amountCents - Amount in cents (negative for expenses, positive for income)
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amountCents: number,
  currency: string = 'USD',
): string {
  const amount = amountCents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    signDisplay: 'auto',
  }).format(amount)
}

/**
 * Parse currency string to cents
 * @param value - Currency string or number
 * @returns Amount in cents
 */
export function parseCurrency(value: string | number): number {
  if (typeof value === 'number') return Math.round(value * 100)
  const cleaned = value.replace(/[^0-9.-]/g, '')
  return Math.round(parseFloat(cleaned) * 100)
}

/**
 * Format cents without currency symbol
 * @param amountCents - Amount in cents
 * @returns Formatted number string
 */
export function formatAmount(amountCents: number): string {
  const amount = amountCents / 100
  return amount.toFixed(2)
}
