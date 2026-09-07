import type { ReactNode } from "react"

export function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon?: ReactNode
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center">
      {icon && <div className="text-4xl">{icon}</div>}
      <p className="font-semibold text-slate-700">{title}</p>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
