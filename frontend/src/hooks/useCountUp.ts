import { animate } from "framer-motion"
import { useEffect, useRef, useState } from "react"

export function useCountUp(value: number, duration = 0.6): number {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)

  useEffect(() => {
    const controls = animate(prev.current, value, {
      duration,
      onUpdate: setDisplay,
    })
    prev.current = value
    return () => controls.stop()
  }, [value, duration])

  return display
}
