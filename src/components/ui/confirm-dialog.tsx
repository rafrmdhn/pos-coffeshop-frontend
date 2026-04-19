import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Info, AlertCircle } from 'lucide-react'

type ConfirmVariant = 'danger' | 'warning' | 'info'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  variant?: ConfirmVariant
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  onConfirm: () => void
}

const CONFIG: Record<ConfirmVariant, {
  icon: React.ElementType
  iconBg: string
  confirmClass: string
}> = {
  danger: {
    icon: AlertTriangle,
    iconBg: 'bg-destructive/10 text-destructive',
    confirmClass: 'bg-destructive hover:bg-destructive/90 text-white border-0',
  },
  warning: {
    icon: AlertCircle,
    iconBg: 'bg-amber-100 text-amber-600',
    confirmClass: 'bg-amber-500 hover:bg-amber-600 text-white border-0',
  },
  info: {
    icon: Info,
    iconBg: 'bg-primary/10 text-primary',
    confirmClass: 'bg-primary hover:bg-primary/90 text-primary-foreground',
  },
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  variant = 'danger',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const { icon: Icon, iconBg, confirmClass } = CONFIG[variant]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] border-border/40 shadow-xl bg-card rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className={`w-11 h-11 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
              <Icon className="h-5 w-5" />
            </div>
            <DialogTitle className="font-serif text-xl font-light">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground leading-relaxed pl-[60px]">
            {message}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="rounded-full"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-full ${confirmClass}`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
