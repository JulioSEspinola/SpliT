import { request } from "../lib/apiClient"
import type { BalanceOut, ExpenseCreateInput, ExpenseOut, SettlementOut } from "../types/api"

export function listGroupExpenses(groupId: string) {
  return request<ExpenseOut[]>(`/groups/${groupId}/expenses`)
}

export function createExpense(payload: ExpenseCreateInput, idempotencyKey: string) {
  return request<ExpenseOut>("/expenses", {
    method: "POST",
    body: payload,
    headers: { "Idempotency-Key": idempotencyKey },
  })
}

export function getGroupBalances(groupId: string) {
  return request<BalanceOut[]>(`/groups/${groupId}/balances`)
}

export function getGroupSettlements(groupId: string) {
  return request<SettlementOut[]>(`/groups/${groupId}/settlements`)
}
