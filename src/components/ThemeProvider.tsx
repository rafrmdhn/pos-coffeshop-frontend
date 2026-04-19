import { useEffect } from 'react'
import { useUiStore } from '@/stores/uiStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useUiStore()

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  return (
    <>
      <div className="texture-overlay"></div>
      {children}
    </>
  )
}
