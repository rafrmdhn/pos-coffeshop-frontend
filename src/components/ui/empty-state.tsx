import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Info, Coffee } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ElementType
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'search' | 'error'
}

export function EmptyState({
  title = 'No data found',
  description = 'There is nothing here yet.',
  icon: Icon,
  action,
  variant = 'default',
}: EmptyStateProps) {
  const DefaultIcon = variant === 'error' ? AlertTriangle : variant === 'search' ? Info : Coffee

  const FinalIcon = Icon || DefaultIcon

  const iconBg = variant === 'error'
    ? 'bg-destructive/10 text-destructive'
    : variant === 'search'
    ? 'bg-muted/40 text-muted-foreground'
    : 'bg-primary/10 text-primary'

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-in fade-in duration-500">
      <div className={`w-16 h-16 rounded-full ${iconBg} flex items-center justify-center mb-4`}>
        <FinalIcon className="h-7 w-7" />
      </div>
      <h3 className="font-serif text-xl font-light text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="mt-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
