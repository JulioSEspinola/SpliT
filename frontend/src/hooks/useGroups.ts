import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createGroup, getGroup, listGroupMembers, listGroups } from "../api/groups"
import { getGroupBalances, getGroupSettlements, listGroupExpenses } from "../api/expenses"
import type { GroupCreateInput } from "../types/api"

export function useGroupsList() {
  return useQuery({ queryKey: ["groups"], queryFn: listGroups })
}

export function useGroup(groupId: string) {
  return useQuery({ queryKey: ["groups", groupId], queryFn: () => getGroup(groupId), enabled: !!groupId })
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: ["groups", groupId, "members"],
    queryFn: () => listGroupMembers(groupId),
    enabled: !!groupId,
  })
}

export function useGroupExpenses(groupId: string) {
  return useQuery({
    queryKey: ["groups", groupId, "expenses"],
    queryFn: () => listGroupExpenses(groupId),
    enabled: !!groupId,
  })
}

export function useGroupBalances(groupId: string) {
  return useQuery({
    queryKey: ["groups", groupId, "balances"],
    queryFn: () => getGroupBalances(groupId),
    enabled: !!groupId,
  })
}

export function useGroupSettlements(groupId: string) {
  return useQuery({
    queryKey: ["groups", groupId, "settlements"],
    queryFn: () => getGroupSettlements(groupId),
    enabled: !!groupId,
  })
}

export function useCreateGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: GroupCreateInput) => createGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}
