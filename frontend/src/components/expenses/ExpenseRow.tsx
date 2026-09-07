import { formatCurrency } from "../../lib/format"
import type { ExpenseOut } from "../../types/api"
import { Avatar } from "../ui/Avatar"
import { Card } from "../ui/Card"

const SPLIT_ICON: Record<ExpenseOut["split_type"], string> = {
  even: "⚖️",
  percentage: "%",
  custom: "✏️",
}

export function ExpenseRow({ expense, payerName }: { expense: ExpenseOut; payerName: string }) {
  const date = new Date(expense.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })

  return (
    <Card className="flex items-center gap-3">
      <Avatar name={payerName} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900">{expense.description || "Expense"}</p>
        <p className="text-xs text-slate-400">
          {payerName} paid · {date} · {SPLIT_ICON[expense.split_type]}
        </p>
      </div>
      <span className="shrink-0 font-bold text-slate-900">{formatCurrency(expense.amount)}</span>
    </Card>
  )
}
