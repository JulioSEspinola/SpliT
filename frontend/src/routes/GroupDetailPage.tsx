import { NavLink, Outlet, useParams } from "react-router-dom"
import { PageHeader } from "../components/layout/PageHeader"
import { Avatar } from "../components/ui/Avatar"
import { Spinner } from "../components/ui/Spinner"
import { useGroup, useGroupMembers } from "../hooks/useGroups"
import type { GroupMemberOut } from "../types/api"

export interface GroupOutletContext {
  groupId: string
  members: GroupMemberOut[]
}

function TabLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex-1 rounded-xl py-2 text-center text-sm font-semibold ${
          isActive ? "bg-white text-brand-600 shadow-card" : "text-slate-500"
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export function GroupDetailPage() {
  const { groupId = "" } = useParams()
  const { data: group, isLoading: groupLoading } = useGroup(groupId)
  const { data: members = [] } = useGroupMembers(groupId)

  if (groupLoading || !group) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title={group.name} back />

      <div className="flex items-center gap-2 px-4 pb-2 pt-3">
        <div className="flex -space-x-2">
          {members.slice(0, 5).map((m) => (
            <div key={m.user_id} className="rounded-full ring-2 ring-white">
              <Avatar name={m.name} size={28} />
            </div>
          ))}
        </div>
        <span className="text-xs text-slate-400">
          {members.length} member{members.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex gap-1 rounded-2xl bg-slate-100 p-1 mx-4">
        <TabLink to="" label="Expenses" />
        <TabLink to="balances" label="Balances" />
        <TabLink to="settle" label="Settle up" />
      </div>

      <div className="px-4 py-4">
        <Outlet context={{ groupId, members } satisfies GroupOutletContext} />
      </div>
    </div>
  )
}
