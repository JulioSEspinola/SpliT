import type { SplitType } from "../../types/api"

const OPTIONS: { value: SplitType; label: string }[] = [
  { value: "even", label: "Even" },
  { value: "percentage", label: "Percentage" },
  { value: "custom", label: "Custom" },
]

export function SplitTypeSelector({
  value,
  onChange,
}: {
  value: SplitType
  onChange: (value: SplitType) => void
}) {
  return (
    <div className="flex rounded-2xl bg-slate-100 p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`tap-target flex-1 rounded-xl text-sm font-semibold transition-colors ${
            value === opt.value ? "bg-white text-brand-600 shadow-card" : "text-slate-500"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
