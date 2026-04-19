import React from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2 } from 'lucide-react'
import { type Outlet, outletService } from '@/services/adminService'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OutletFormDialog } from '@/components/admin/OutletFormDialog'

export default function OutletPage() {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Outlet | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-outlets'],
    queryFn: () => outletService.getOutlets(),
  })

  const createMutation = useMutation({
    mutationFn: (d: Partial<Outlet>) => outletService.createOutlet(d as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-outlets'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, d }: { id: string; d: Partial<Outlet> }) =>
      outletService.updateOutlet(id, d as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-outlets'] }),
  })

  const handleSubmit = async (d: Partial<Outlet>) => {
    if (selected) await updateMutation.mutateAsync({ id: selected.id, d })
    else await createMutation.mutateAsync(d)
  }

  const columns: ColumnDef<Outlet>[] = [
    {
      accessorKey: 'name',
      header: 'Outlet Name',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-foreground">{row.getValue('name')}</div>
          <div className="text-xs text-muted-foreground font-mono">{row.original.slug}</div>
        </div>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm max-w-[220px] truncate">
          {row.getValue('address') || '—'}
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('phone') || '—'}</div>,
    },
    {
      accessorKey: 'timezone',
      header: 'Timezone',
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-muted/30 px-2 py-0.5 rounded-full">
          {row.getValue('timezone')}
        </span>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => {
        const active = row.getValue('is_active')
        return (
          <Badge variant={active ? 'default' : 'secondary'} className={active ? 'bg-success/20 text-success border-0' : 'opacity-50'}>
            {active ? 'ACTIVE' : 'INACTIVE'}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="ghost" size="icon"
          className="text-muted-foreground hover:text-primary rounded-full"
          onClick={() => { setSelected(row.original); setFormOpen(true) }}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="p-8 pb-12 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-light text-foreground tracking-tight">Outlets</h1>
          <p className="text-muted-foreground font-light mt-1 text-lg">Manage all cafe outlet branches.</p>
        </div>
        <Button
          onClick={() => { setSelected(null); setFormOpen(true) }}
          className="rounded-full shadow-md bg-primary hover:bg-primary/90 text-primary-foreground pl-4 pr-6"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Outlet
        </Button>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border/40 p-6 rounded-[2rem] shadow-sm">
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          searchKey="name"
          searchPlaceholder="Search outlet name..."
          emptyMessage="No outlets found."
        />
      </div>

      <OutletFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        outlet={selected}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
