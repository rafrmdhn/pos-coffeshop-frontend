import React from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { type User } from '@/services/adminService'
import { userService, outletService, roleService } from '@/services/adminService'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserFormDialog } from '@/components/admin/UserFormDialog'

export default function UserManagementPage() {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<User | null>(null)

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => userService.getUsers(),
  })

  const { data: outletsData } = useQuery({
    queryKey: ['admin-outlets'],
    queryFn: () => outletService.getOutlets(),
  })

  const { data: rolesData } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => roleService.getRoles(),
  })

  const createMutation = useMutation({
    mutationFn: (d: Partial<User> & { password?: string }) => userService.createUser(d as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, d }: { id: string; d: Partial<User> }) => userService.updateUser(id, d as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const handleSubmit = async (d: Partial<User> & { password?: string }) => {
    if (selected) await updateMutation.mutateAsync({ id: selected.id, d })
    else await createMutation.mutateAsync(d)
  }

  const handleDelete = (user: User) => {
    if (window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(user.id)
    }
  }

  const outlets = outletsData?.data || []
  const roleNames = (rolesData?.data || []).map(r => r.name)

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-foreground">{row.getValue('name')}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'roles',
      header: 'Role',
      cell: ({ row }) => {
        const roles = row.getValue('roles') as string[]
        const colorMap: Record<string, string> = {
          owner: 'bg-amber-100 text-amber-700 border-amber-200',
          manager: 'bg-blue-100 text-blue-700 border-blue-200',
          cashier: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        }
        return (
          <div className="flex gap-1 flex-wrap">
            {roles.map(r => (
              <span key={r} className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${colorMap[r] || 'bg-muted/30 text-muted-foreground border-border'}`}>
                {r}
              </span>
            ))}
          </div>
        )
      },
    },
    {
      id: 'outlet',
      header: 'Outlet',
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">{row.original.outlet?.name || '—'}</div>
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
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost" size="icon"
              className="text-muted-foreground hover:text-primary rounded-full"
              onClick={() => { setSelected(user); setFormOpen(true) }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" size="icon"
              className="text-muted-foreground hover:text-destructive rounded-full"
              onClick={() => handleDelete(user)}
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
          <h1 className="text-4xl font-serif font-light text-foreground tracking-tight">Users</h1>
          <p className="text-muted-foreground font-light mt-1 text-lg">Manage all staff accounts and roles.</p>
        </div>
        <Button
          onClick={() => { setSelected(null); setFormOpen(true) }}
          className="rounded-full shadow-md bg-primary hover:bg-primary/90 text-primary-foreground pl-4 pr-6"
        >
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border/40 p-6 rounded-[2rem] shadow-sm">
        <DataTable
          columns={columns}
          data={usersData?.data || []}
          isLoading={isLoading}
          searchKey="name"
          searchPlaceholder="Search by name..."
          emptyMessage="No users found."
        />
      </div>

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={selected as any}
        outlets={outlets}
        roles={roleNames}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
