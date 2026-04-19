import React from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { roleService, type Role, type Permission } from '@/services/adminService'
import { useQuery } from '@tanstack/react-query'

interface RoleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role | null
  onSubmit: (data: { name: string; permissions: string[] }) => Promise<void>
}

// Group permissions by first word of their name (e.g. "view-products" → "view")
function groupPermissions(permissions: Permission[]): Record<string, Permission[]> {
  return permissions.reduce((acc, p) => {
    const group = p.name.split('-')[0] || 'other'
    if (!acc[group]) acc[group] = []
    acc[group].push(p)
    return acc
  }, {} as Record<string, Permission[]>)
}

export function RoleFormDialog({ open, onOpenChange, role, onSubmit }: RoleFormDialogProps) {
  const [roleName, setRoleName] = React.useState('')
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { data: permData } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => roleService.getPermissions(),
  })

  const permissions = permData?.data || []
  const grouped = groupPermissions(permissions)

  React.useEffect(() => {
    if (open) {
      setRoleName(role?.name || '')
      setSelected(new Set(role?.permissions || []))
    }
  }, [open, role])

  const togglePermission = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const toggleGroup = (group: string) => {
    const groupPerms = grouped[group].map(p => p.name)
    const allSelected = groupPerms.every(p => selected.has(p))
    setSelected(prev => {
      const next = new Set(prev)
      if (allSelected) {
        groupPerms.forEach(p => next.delete(p))
      } else {
        groupPerms.forEach(p => next.add(p))
      }
      return next
    })
  }

  const handleSubmit = async () => {
    if (!roleName.trim()) return
    try {
      setIsSubmitting(true)
      await onSubmit({ name: roleName.trim(), permissions: Array.from(selected) })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isBuiltin = false // API doesn't expose is_builtin; treat all as editable

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] border-border/40 shadow-xl bg-card rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light">
            {role ? 'Edit Role' : 'Create Role'}
          </DialogTitle>
          <DialogDescription className="font-light text-muted-foreground">
            Define a role and assign module-level permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div>
            <label className="text-sm font-medium text-foreground/80 block mb-1.5">Role Name</label>
            <Input
              value={roleName}
              onChange={e => setRoleName(e.target.value)}
              placeholder="e.g. senior-cashier"
              disabled={isBuiltin}
              className="rounded-xl bg-muted/20 max-w-xs"
            />
            {isBuiltin && (
              <p className="text-xs text-muted-foreground mt-1.5">
                Built-in role names cannot be renamed.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(grouped).map(([group, perms]) => {
              const allSelected = perms.every(p => selected.has(p.name))
              const someSelected = perms.some(p => selected.has(p.name))
              return (
                <div key={group} className="bg-muted/20 border border-border/40 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-foreground">{group}</span>
                    <button
                      type="button"
                      onClick={() => toggleGroup(group)}
                      className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                        allSelected
                          ? 'bg-primary/20 text-primary'
                          : someSelected
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {allSelected ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  {perms.map(p => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(p.name)}
                        onChange={() => togglePermission(p.name)}
                        className="rounded accent-primary w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                        {p.name}
                      </span>
                    </label>
                  ))}
                </div>
              )
            })}
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{selected.size}</span> permissions selected
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || !roleName.trim()}
            onClick={handleSubmit}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSubmitting ? 'Saving...' : 'Save Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
