import { initials } from "../../lib/format"

const PALETTE = ["#3763f4", "#16a34a", "#dc2626", "#d97706", "#7c3aed", "#0891b2"]

function colorFor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: colorFor(name), fontSize: size * 0.38 }}
    >
      {initials(name) || "?"}
    </div>
  )
}
