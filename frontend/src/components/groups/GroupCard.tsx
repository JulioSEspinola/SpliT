import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useCountUp } from "../../hooks/useCountUp"
import { useGroupBalances } from "../../hooks/useGroups"
import { netBalanceForUser } from "../../lib/balanceMath"
import { formatCurrency } from "../../lib/format"
import type { GroupOut } from "../../types/api"
import { Card } from "../ui/Card"
import { Spinner } from "../ui/Spinner"

export function GroupCard({ group }: { group: GroupOut }) {
  const { user } = useAuth()
  const { data: balances, isLoading } = useGroupBalances(group.id)

  const net = user && balances ? netBalanceForUser(balances, user.id) : 0
  const displayNet = useCountUp(net)

  const tone = net > 0.005 ? "owed" : net < -0.005 ? "owing" : "neutral"
  const toneClasses = {
    owed: "bg-owed-bg text-owed",
    owing: "bg-owing-bg text-owing",
    neutral: "bg-slate-100 text-slate-500",
  }[tone]

  const label = tone === "owed" ? "you're owed" : tone === "owing" ? "you owe" : "settled up"

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <Link to={`/groups/${group.id}`}>
        <Card className="flex items-center justify-between gap-3 active:scale-[0.98] transition-transform">
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{group.name}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
          {isLoading ? (
            <Spinner />
          ) : (
            <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${toneClasses}`}>
              {formatCurrency(Math.abs(displayNet))}
            </span>
          )}
        </Card>
      </Link>
    </motion.div>
  )
}
