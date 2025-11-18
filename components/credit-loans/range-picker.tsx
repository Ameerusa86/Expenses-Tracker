'use client'

import { useSearchParams, useRouter } from 'next/navigation'

export function CreditLoansRangePicker() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const current = searchParams.get('range') || '30d'

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value
    const sp = new URLSearchParams(searchParams as any)
    if (value === '30d') sp.delete('range')
    else sp.set('range', value)
    const qs = sp.toString()
    router.push(qs ? `?${qs}` : '?')
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Summary:</span>
      <select
        className="h-9 rounded-md border bg-background px-2 text-sm"
        value={current}
        onChange={onChange}
      >
        <option value="30d">Last 30 days</option>
        <option value="last-month">Last month</option>
        <option value="this-month">This month</option>
        <option value="all">All time</option>
      </select>
    </div>
  )
}
