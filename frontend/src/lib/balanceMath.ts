import type { BalanceOut } from "../types/api"

/** Positive = userId is owed money overall; negative = userId owes money overall. */
export function netBalanceForUser(balances: BalanceOut[], userId: string): number {
  return balances.reduce((total, b) => {
    if (b.user_a === userId) return total + b.amount
    if (b.user_b === userId) return total - b.amount
    return total
  }, 0)
}
