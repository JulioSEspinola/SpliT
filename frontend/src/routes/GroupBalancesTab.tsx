import confetti from "canvas-confetti"
import { useEffect, useRef } from "react"
import { useOutletContext } from "react-router-dom"
import { BalanceBar } from "../components/balances/BalanceBar"
import { EmptyState } from "../components/ui/EmptyState"
import { Spinner } from "../components/ui/Spinner"
import { useAuth } from "../context/AuthContext"
import { useGroupBalances } from "../hooks/useGroups"
import type { GroupOutletContext } from "./GroupDetailPage"

export function GroupBalancesTab() {
  const { groupId, members } = useOutletContext<GroupOutletContext>()
  const { user } = useAuth()
  const { data: balances, isLoading } = useGroupBalances(groupId)
  const hadBalancesRef = useRef(false)

  useEffect(() => {
    if (!balances) return
    if (hadBalancesRef.current && balances.length === 0) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } })
    }
    hadBalancesRef.current = balances.length > 0
  }, [balances])

  const nameFor = (userId: string) => members.find((m) => m.user_id === userId)?.name ?? "Someone"

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (!balances || balances.length === 0) {
    return <EmptyState icon="✨" title="All settled up!" subtitle="No one owes anyone in this group." />
  }

  const maxAmount = Math.max(...balances.map((b) => b.amount))

  return (
    <div className="space-y-4">
      {balances.map((b, i) => {
        const tone = user?.id === b.user_a ? "owed" : user?.id === b.user_b ? "owing" : "neutral"
        return (
          <BalanceBar
            key={i}
            label={`${nameFor(b.user_b)} owes ${nameFor(b.user_a)}`}
            amount={b.amount}
            maxAmount={maxAmount}
            tone={tone}
          />
        )
      })}
    </div>
  )
}
