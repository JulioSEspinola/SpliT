import { request } from "../lib/apiClient"
import type { UserOut } from "../types/api"

export function getUser(userId: string) {
  return request<UserOut>(`/users/${userId}`)
}
