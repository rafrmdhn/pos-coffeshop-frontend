import { useRef, useState, useEffect } from 'react'

/**
 * useLazyVisible — returns a ref and a boolean `isVisible`.
 * The boolean becomes true once the attached element enters the viewport.
 * Used for conditional rendering of expensive components (charts, heavy images).
 */
export function useLazyVisible(rootMargin = '100px') {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect() // only need to trigger once
        }
      },
      { rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return { ref, isVisible }
}
