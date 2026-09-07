import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createExpense } from "../api/expenses"
import type { ExpenseCreateInput } from "../types/api"

export function useCreateExpense(groupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ExpenseCreateInput) => createExpense(payload, crypto.randomUUID()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", groupId, "expenses"] })
      queryClient.invalidateQueries({ queryKey: ["groups", groupId, "balances"] })
      queryClient.invalidateQueries({ queryKey: ["groups", groupId, "settlements"] })
    },
  })
}
