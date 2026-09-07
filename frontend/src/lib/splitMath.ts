/**
 * Mirrors the rounding rules in app/services/expense_service.py so the
 * client-side split preview matches what the server actually persists.
 * All math happens in integer cents to avoid floating-point drift.
 */

const toCents = (dollars: number) => Math.round(dollars * 100)
const toDollars = (cents: number) => cents / 100

export function computeEvenSplit(amount: number, memberIds: string[]): Record<string, number> {
  if (memberIds.length === 0) return {}

  const amountCents = toCents(amount)
  const n = memberIds.length
  const baseShareCents = Math.round(amountCents / n)
  const remainderCents = amountCents - baseShareCents * n

  const cents: Record<string, number> = {}
  memberIds.forEach((id, i) => {
    cents[id] = baseShareCents + (i === 0 ? remainderCents : 0)
  })

  return Object.fromEntries(Object.entries(cents).map(([id, c]) => [id, toDollars(c)]))
}

export function computePercentageSplit(
  amount: number,
  entries: { user_id: string; value: number }[],
): Record<string, number> {
  const amountCents = toCents(amount)
  const cents: Record<string, number> = {}
  let running = 0

  entries.forEach((entry, i) => {
    if (i === entries.length - 1) {
      cents[entry.user_id] = amountCents - running
    } else {
      const share = Math.round((amountCents * entry.value) / 100)
      cents[entry.user_id] = share
      running += share
    }
  })

  return Object.fromEntries(Object.entries(cents).map(([id, c]) => [id, toDollars(c)]))
}

export function sumPercentages(entries: { value: number }[]): number {
  return entries.reduce((total, e) => total + (e.value || 0), 0)
}

export function sumCustomValues(entries: { value: number }[]): number {
  return Math.round(entries.reduce((total, e) => total + (e.value || 0), 0) * 100) / 100
}
