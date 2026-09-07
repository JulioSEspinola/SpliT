import type { ComponentProps } from "react"
import { motion } from "framer-motion"

type MotionButtonProps = ComponentProps<typeof motion.button>

interface ButtonProps extends MotionButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  fullWidth?: boolean
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-brand-500 text-white shadow-card",
  secondary: "bg-white text-slate-900 border border-slate-200 shadow-card",
  ghost: "bg-transparent text-slate-600",
  danger: "bg-owing text-white shadow-card",
}

export function Button({
  variant = "primary",
  fullWidth,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      className={`tap-target inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-opacity disabled:opacity-50 ${
        variantClasses[variant]
      } ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  )
}
