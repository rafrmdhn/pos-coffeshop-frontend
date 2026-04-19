import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { Toaster } from '@/components/ui/sonner'
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt'

function App() {
  return (
    <>
      <RouterProvider router={router} />
      {/* Global toast provider — success=green, error=red, auto-dismiss 5s */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 5000,
          classNames: {
            toast: 'rounded-2xl border-border/40 bg-card shadow-xl font-sans',
            title: 'font-semibold text-foreground',
            description: 'text-muted-foreground',
            success: 'border-l-4 border-success',
            error: 'border-l-4 border-destructive',
            warning: 'border-l-4 border-amber-500',
          },
        }}
        richColors
      />
      <PwaInstallPrompt />
    </>
  )
}

export default App
