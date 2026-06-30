import { useEffect, useRef, useState } from 'react'

/**
 * Returns an animated integer value that counts from 0 → target
 * once `active` becomes true.
 * @param {number} target   – end value
 * @param {number} duration – ms, default 2000
 */
export function useCounter(target, duration = 2000, active = false) {
  const [value, setValue] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    if (!active) return
    const start = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3) // cubic ease-out
      setValue(Math.round(ease * target))
      if (progress < 1) raf.current = requestAnimationFrame(tick)
    }

    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [active, target, duration])

  return value
}
