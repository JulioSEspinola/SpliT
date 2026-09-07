import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { formatCurrency } from "../../lib/format"
import type { SettlementOut } from "../../types/api"
import { Card } from "../ui/Card"

export function SettlementChecklist({
  settlements,
  memberNames,
}: {
  settlements: SettlementOut[]
  memberNames: Record<string, string>
}) {
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {settlements.map((s, i) => {
          const isChecked = checked.has(i)
          return (
            <motion.div
              key={`${s.from_user}-${s.to_user}-${i}`}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card
                className={`flex cursor-pointer items-center gap-3 transition-colors ${
                  isChecked ? "bg-owed-bg" : ""
                }`}
                onClick={() => toggle(i)}
              >
                <div
                  className={`tap-target flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs text-white ${
                    isChecked ? "border-owed bg-owed" : "border-slate-300"
                  }`}
                >
                  {isChecked && "✓"}
                </div>
                <p className={`flex-1 text-sm ${isChecked ? "text-slate-400 line-through" : "text-slate-700"}`}>
                  <span className="font-semibold">{memberNames[s.from_user] ?? "Someone"}</span> pays{" "}
                  <span className="font-semibold">{memberNames[s.to_user] ?? "someone"}</span>
                </p>
                <span className="shrink-0 font-bold text-slate-900">{formatCurrency(s.amount)}</span>
              </Card>
            </motion.div>
          )
        })}
      </AnimatePresence>
      <p className="px-1 text-xs text-slate-400">
        Checking a row is just a reminder — log the actual payment as an expense to update real balances.
      </p>
    </div>
  )
}
