import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"

export function PageHeader({
  title,
  back,
  action,
}: {
  title: string
  back?: boolean
  action?: ReactNode
}) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur">
      {back && (
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="tap-target -ml-2 flex items-center justify-center rounded-full text-xl text-slate-600"
        >
          ←
        </button>
      )}
      <h1 className="flex-1 truncate text-lg font-bold text-slate-900">{title}</h1>
      {action}
    </header>
  )
}
