import { useOutletContext } from "react-router-dom"
import { ExpenseRow } from "../components/expenses/ExpenseRow"
import { EmptyState } from "../components/ui/EmptyState"
import { Spinner } from "../components/ui/Spinner"
import { useGroupExpenses } from "../hooks/useGroups"
import type { GroupOutletContext } from "./GroupDetailPage"

export function GroupExpensesTab() {
  const { groupId, members } = useOutletContext<GroupOutletContext>()
  const { data: expenses, isLoading } = useGroupExpenses(groupId)

  const nameFor = (userId: string) => members.find((m) => m.user_id === userId)?.name ?? "Someone"

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (!expenses || expenses.length === 0) {
    return <EmptyState icon="🧾" title="No expenses yet" subtitle="Tap + to add the first one." />
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <ExpenseRow key={expense.id} expense={expense} payerName={nameFor(expense.paid_by)} />
      ))}
    </div>
  )
}
