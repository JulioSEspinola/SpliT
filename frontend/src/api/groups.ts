import { request } from "../lib/apiClient"
import type { GroupCreateInput, GroupMemberOut, GroupOut } from "../types/api"

export function listGroups() {
  return request<GroupOut[]>("/groups")
}

export function getGroup(groupId: string) {
  return request<GroupOut>(`/groups/${groupId}`)
}

export function createGroup(payload: GroupCreateInput) {
  return request<GroupOut>("/groups", { method: "POST", body: payload })
}

export function listGroupMembers(groupId: string) {
  return request<GroupMemberOut[]>(`/groups/${groupId}/members`)
}
