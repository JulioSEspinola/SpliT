import { useOutletContext } from "react-router-dom"
import { SettlementChecklist } from "../components/balances/SettlementChecklist"
import { EmptyState } from "../components/ui/EmptyState"
import { Spinner } from "../components/ui/Spinner"
import { useGroupSettlements } from "../hooks/useGroups"
import type { GroupOutletContext } from "./GroupDetailPage"

export function GroupSettleUpTab() {
  const { groupId, members } = useOutletContext<GroupOutletContext>()
  const { data: settlements, isLoading } = useGroupSettlements(groupId)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (!settlements || settlements.length === 0) {
    return <EmptyState icon="🙌" title="Nothing to settle" subtitle="This group is all even." />
  }

  const memberNames = Object.fromEntries(members.map((m) => [m.user_id, m.name]))

  return <SettlementChecklist settlements={settlements} memberNames={memberNames} />
}
