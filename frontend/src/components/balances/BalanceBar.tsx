import { motion } from "framer-motion"
import { formatCurrency } from "../../lib/format"

export function BalanceBar({
  label,
  amount,
  maxAmount,
  tone = "neutral",
}: {
  label: string
  amount: number
  maxAmount: number
  tone?: "owed" | "owing" | "neutral"
}) {
  const pct = maxAmount > 0 ? Math.min(100, (amount / maxAmount) * 100) : 0
  const barColor = tone === "owed" ? "bg-owed" : tone === "owing" ? "bg-owing" : "bg-brand-400"
  const textColor = tone === "owed" ? "text-owed" : tone === "owing" ? "text-owing" : "text-slate-900"

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-slate-700">{label}</span>
        <span className={`shrink-0 font-semibold ${textColor}`}>{formatCurrency(amount)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  )
}
