import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { PageHeader } from "../components/layout/PageHeader"
import { SplitPreview } from "../components/expenses/SplitPreview"
import { SplitTypeSelector } from "../components/expenses/SplitTypeSelector"
import { Avatar } from "../components/ui/Avatar"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { useAuth } from "../context/AuthContext"
import { useCreateExpense } from "../hooks/useExpenseMutation"
import { useGroupMembers } from "../hooks/useGroups"
import { computeEvenSplit, computePercentageSplit, sumCustomValues, sumPercentages } from "../lib/splitMath"
import type { ExpenseSplitIn, SplitType } from "../types/api"

export function AddExpensePage() {
  const { groupId = "" } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: members = [] } = useGroupMembers(groupId)
  const createExpense = useCreateExpense(groupId)

  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [paidBy, setPaidBy] = useState(user?.id ?? "")
  const [splitType, setSplitType] = useState<SplitType>("even")
  const [rawValues, setRawValues] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!paidBy && user) setPaidBy(user.id)
  }, [user, paidBy])

  const memberIds = members.map((m) => m.user_id)
  const amountNumber = Number(amount) || 0

  const entries = useMemo(
    () => memberIds.map((id) => ({ user_id: id, value: Number(rawValues[id]) || 0 })),
    [memberIds, rawValues],
  )

  const preview = useMemo(() => {
    if (splitType === "even") return computeEvenSplit(amountNumber, memberIds)
    if (splitType === "percentage") return computePercentageSplit(amountNumber, entries)
    return Object.fromEntries(entries.map((e) => [e.user_id, e.value]))
  }, [splitType, amountNumber, memberIds, entries])

  const percentTotal = sumPercentages(entries)
  const customTotal = sumCustomValues(entries)

  const splitValid =
    splitType === "even" ||
    (splitType === "percentage" && Math.abs(percentTotal - 100) < 0.01) ||
    (splitType === "custom" && Math.abs(customTotal - amountNumber) < 0.01)

  const canSubmit = amountNumber > 0 && paidBy && splitValid && !createExpense.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    const splits: ExpenseSplitIn[] | undefined = splitType === "even" ? undefined : entries

    await createExpense.mutateAsync({
      group_id: groupId,
      paid_by: paidBy,
      amount: amountNumber,
      description: description || undefined,
      split_type: splitType,
      splits,
    })

    navigate(`/groups/${groupId}`, { replace: true })
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Add expense" back />

      <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4">
        <Card className="space-y-3">
          <input
            required
            type="number"
            step="0.01"
            min="0.01"
            inputMode="decimal"
            autoFocus
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-2xl font-bold outline-none focus:border-brand-400"
          />
          <input
            placeholder="What was this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-400"
          />
        </Card>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">Paid by</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {members.map((m) => (
              <button
                type="button"
                key={m.user_id}
                onClick={() => setPaidBy(m.user_id)}
                className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium ${
                  paidBy === m.user_id ? "bg-brand-50 text-brand-700" : "text-slate-500"
                }`}
              >
                <Avatar name={m.name} />
                {m.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">Split</p>
          <SplitTypeSelector value={splitType} onChange={setSplitType} />
        </div>

        {splitType !== "even" && (
          <Card className="space-y-2">
            {members.map((m) => (
              <div key={m.user_id} className="flex items-center gap-3">
                <Avatar name={m.name} size={28} />
                <span className="flex-1 text-sm text-slate-700">{m.name}</span>
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder={splitType === "percentage" ? "%" : "$"}
                  value={rawValues[m.user_id] ?? ""}
                  onChange={(e) => setRawValues((prev) => ({ ...prev, [m.user_id]: e.target.value }))}
                  className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm outline-none focus:border-brand-400"
                />
              </div>
            ))}
            <p className={`text-xs ${splitValid ? "text-slate-400" : "text-owing"}`}>
              {splitType === "percentage"
                ? `Total: ${percentTotal.toFixed(1)}% (must equal 100%)`
                : `Total: $${customTotal.toFixed(2)} (must equal $${amountNumber.toFixed(2)})`}
            </p>
          </Card>
        )}

        {amountNumber > 0 && members.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Preview</p>
            <SplitPreview members={members} splits={preview} />
          </div>
        )}

        {createExpense.isError && <p className="text-sm text-owing">Couldn't save that expense. Try again.</p>}

        <Button type="submit" fullWidth disabled={!canSubmit}>
          {createExpense.isPending ? "Saving…" : "Add expense"}
        </Button>
      </form>
    </div>
  )
}
