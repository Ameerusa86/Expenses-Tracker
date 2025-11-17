export function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function isBefore(a: Date, b: Date) {
  return a.getTime() < b.getTime()
}
