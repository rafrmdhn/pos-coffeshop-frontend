import React from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, ShieldCheck } from 'lucide-react'
import { roleService, type Role } from '@/services/adminService'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RoleFormDialog } from '@/components/admin/RoleFormDialog'

export default function RoleManagementPage() {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Role | null>(null)

  const { data: rolesData, isLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => roleService.getRoles(),
  })

  const createMutation = useMutation({
    mutationFn: (d: { name: string; permissions: string[] }) => roleService.createRole(d),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-roles'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, d }: { id: number; d: { name?: string; permissions?: string[] } }) =>
      roleService.updateRole(id, d),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-roles'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => roleService.deleteRole(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-roles'] }),
  })

  const handleSubmit = async (d: { name: string; permissions: string[] }) => {
    if (selected) await updateMutation.mutateAsync({ id: selected.id, d })
    else await createMutation.mutateAsync(d)
  }

  const handleDelete = async (role: Role) => {
    if ((role.users_count ?? 0) > 0) return alert('Cannot delete a role assigned to active users.')
    if (window.confirm(`Delete role "${role.name}"?`)) {
      try {
        await deleteMutation.mutateAsync(role.id)
      } catch (e: any) {
        alert(e.message)
      }
    }
  }

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: 'name',
      header: 'Role Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground capitalize">{row.getValue('name')}</span>
          <ShieldCheck className="h-3.5 w-3.5 text-primary opacity-50" />
        </div>
      ),
    },
    {
      id: 'permissions_count',
      header: 'Permissions',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {(row.original.permissions?.length ?? 0)} permissions
        </span>
      ),
    },
    {
      accessorKey: 'users_count',
      header: 'Users',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.getValue('users_count') ?? 0} users
        </span>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      cell: () => (
        <Badge variant="outline" className="bg-muted/20 text-muted-foreground border-border">
          System
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const role = row.original
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost" size="icon"
              className="text-muted-foreground hover:text-primary rounded-full"
              onClick={() => { setSelected(role); setFormOpen(true) }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" size="icon"
              className="text-muted-foreground hover:text-destructive rounded-full"
              onClick={() => handleDelete(role)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="p-8 pb-12 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-light text-foreground tracking-tight">Roles &amp; Permissions</h1>
          <p className="text-muted-foreground font-light mt-1 text-lg">Configure what each role is allowed to do.</p>
        </div>
        <Button
          onClick={() => { setSelected(null); setFormOpen(true) }}
          className="rounded-full shadow-md bg-primary hover:bg-primary/90 text-primary-foreground pl-4 pr-6"
        >
          <Plus className="mr-2 h-4 w-4" /> Create Role
        </Button>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border/40 p-6 rounded-[2rem] shadow-sm">
        <DataTable
          columns={columns}
          data={rolesData?.data || []}
          isLoading={isLoading}
          emptyMessage="No roles found."
        />
      </div>

      <RoleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        role={selected}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
