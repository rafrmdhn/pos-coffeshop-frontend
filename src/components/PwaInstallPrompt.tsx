import React from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * PwaInstallPrompt — listens for the browser's `beforeinstallprompt` event
 * and shows a dismissable bottom banner inviting the user to install the PWA.
 * Once dismissed or installed it stays hidden for 30 days via localStorage.
 */
export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed')
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10)
      const thirtyDays = 30 * 24 * 60 * 60 * 1000
      if (Date.now() - dismissedAt < thirtyDays) return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      localStorage.setItem('pwa-prompt-dismissed', String(Date.now()))
    }
    setDeferredPrompt(null)
    setVisible(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', String(Date.now()))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-4 bg-card border border-border/40 shadow-2xl rounded-2xl px-5 py-4 max-w-sm w-[calc(100vw-2rem)]">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">Install Kopi POS</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Add to your home screen for the full app experience.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={handleInstall}
            className="rounded-full text-xs bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-4"
          >
            Install
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-full text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
