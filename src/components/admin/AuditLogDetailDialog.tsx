import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { type AuditLog } from '@/types/api'

interface AuditLogDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  log: AuditLog | null
}

function JsonDiff({ label, value }: { label: string; value: any }) {
  if (value === null || value === undefined) {
    return (
      <div className="flex-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
        <div className="bg-muted/20 rounded-xl p-3 text-xs text-muted-foreground italic">null</div>
      </div>
    )
  }
  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
      <pre className="bg-muted/20 rounded-xl p-3 text-xs text-foreground overflow-x-auto whitespace-pre-wrap break-words">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  )
}

export function AuditLogDetailDialog({ open, onOpenChange, log }: AuditLogDetailDialogProps) {
  if (!log) return null

  const formatDate = (d: string) => new Date(d).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] border-border/40 shadow-xl bg-card rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light capitalize">
            {log.action}: {log.entity_type}
          </DialogTitle>
          <DialogDescription className="font-light text-muted-foreground">
            {formatDate(log.created_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'User ID', value: log.user_id },
              { label: 'Entity ID', value: log.entity_id },
              { label: 'IP Address', value: log.ip_address || '—' },
              { label: 'User Agent', value: log.user_agent || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/20 border border-border/40 rounded-xl p-3">
                <div className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wider">{label}</div>
                <div className="font-mono text-xs text-foreground break-all">{value}</div>
              </div>
            ))}
          </div>

          {/* Diff viewer */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Change Diff</p>
            <div className="flex gap-4">
              <JsonDiff label="Old Values" value={log.old_values} />
              <JsonDiff label="New Values" value={log.new_values} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
