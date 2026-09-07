import { formatCurrency } from "../../lib/format"
import type { GroupMemberOut } from "../../types/api"

export function SplitPreview({
  members,
  splits,
}: {
  members: GroupMemberOut[]
  splits: Record<string, number>
}) {
  return (
    <ul className="divide-y divide-slate-100 rounded-2xl bg-white shadow-card">
      {members.map((m) => (
        <li key={m.user_id} className="flex items-center justify-between px-4 py-3 text-sm">
          <span className="text-slate-700">{m.name}</span>
          <span className="font-semibold text-slate-900">{formatCurrency(splits[m.user_id] ?? 0)}</span>
        </li>
      ))}
    </ul>
  )
}
