import React from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { type AuditLog, auditLogService } from '@/services/adminService'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { AuditLogDetailDialog } from '@/components/admin/AuditLogDetailDialog'

const ACTION_COLORS: Record<string, string> = {
  created: 'bg-success/15 text-success border-0',
  updated: 'bg-blue-100 text-blue-600 border-0',
  deleted: 'bg-destructive/15 text-destructive border-0',
}

export default function AuditLogPage() {
  const [selected, setSelected] = React.useState<AuditLog | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => auditLogService.getAuditLogs(),
  })

  const formatDate = (d: string) => new Date(d).toLocaleString('id-ID')

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: 'created_at',
      header: 'Time',
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm whitespace-nowrap">
          {formatDate(row.getValue('created_at'))}
        </div>
      ),
    },
    {
      accessorKey: 'user_id',
      header: 'User',
      cell: ({ row }) => (
        <div className="font-medium text-foreground font-mono text-xs">
          {row.getValue('user_id')}
        </div>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => {
        const action = row.getValue('action') as string
        return (
          <Badge className={`capitalize ${ACTION_COLORS[action] || 'bg-muted/30 text-muted-foreground border-0'}`}>
            {action}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'auditable_type',
      header: 'Entity',
      cell: ({ row }) => (
        <div>
          <div className="text-foreground font-medium">{row.getValue('auditable_type')}</div>
          <div className="text-xs text-muted-foreground font-mono">{row.original.auditable_id}</div>
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="ghost" size="sm"
          className="text-primary hover:text-primary rounded-full hover:bg-primary/10"
          onClick={() => { setSelected(row.original); setDialogOpen(true) }}
        >
          <Eye className="h-4 w-4 mr-1" /> Detail
        </Button>
      ),
    },
  ]

  return (
    <div className="p-8 pb-12 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-serif font-light text-foreground tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground font-light mt-1 text-lg">
          Full trace of system changes made by admin users.
        </p>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border/40 p-6 rounded-[2rem] shadow-sm">
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          searchKey="auditable_type"
          searchPlaceholder="Search entity type..."
          emptyMessage="No audit logs found."
        />
      </div>

      <AuditLogDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        log={selected as any}
      />
    </div>
  )
}
