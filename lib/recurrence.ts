import { addDays, isBefore } from './time'

export function biWeeklyOccurrences(
  startDate: Date,
  count: number,
  from: Date,
) {
  const results: Date[] = []
  // Find the first occurrence on/after 'from'
  let d = new Date(startDate)
  while (isBefore(d, from)) {
    d = addDays(d, 14)
  }
  while (results.length < count) {
    results.push(new Date(d))
    d = addDays(d, 14)
  }
  return results
}
