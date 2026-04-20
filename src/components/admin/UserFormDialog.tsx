import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormField, FormItem,
  FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type User, type Outlet } from '@/types/api'

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  outlets: Outlet[]
  roles: string[]
  onSubmit: (data: Partial<User> & { password?: string }) => Promise<void>
}

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  outlet_id: z.string().min(1, 'Outlet is required'),
  pin: z.string().min(4, 'PIN must be at least 4 digits').max(6, 'PIN cannot exceed 6 digits').optional(),
  is_active: z.boolean().default(true),
  password: z.string().optional(),
  password_confirmation: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password !== data.password_confirmation) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["password_confirmation"],
})

type FormValues = z.infer<typeof schema>

export function UserFormDialog({ open, onOpenChange, user, outlets, roles, onSubmit }: UserFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const isEdit = !!user

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.roles?.[0] || 'cashier',
      outlet_id: user?.outlet_id || '',
      pin: user?.pin || '',
      is_active: user?.is_active ?? true,
      password: '',
      password_confirmation: '',
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        role: user?.roles?.[0] || 'cashier',
        outlet_id: user?.outlet_id || '',
        pin: user?.pin || '',
        is_active: user?.is_active ?? true,
        password: '',
        password_confirmation: '',
      })
    }
  }, [user, open, form])

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)
      // API expects singular 'role' string and requires password_confirmation
      await onSubmit(values as any)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-border/40 shadow-xl bg-card rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light">
            {isEdit ? 'Edit User' : 'Create User'}
          </DialogTitle>
          <DialogDescription className="font-light text-muted-foreground">
            Manage staff accounts and access levels.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 pt-4">
            <FormField control={form.control} name="name" render={({ field }: any) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Budi Santoso" className="rounded-xl bg-muted/20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="email" render={({ field }: any) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="staff@example.id" className="rounded-xl bg-muted/20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="phone" render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="081x-xxxx-xxxx" className="rounded-xl bg-muted/20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="role" render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl className="rounded-xl bg-muted/20">
                      <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {roles.map(r => (
                        <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="outlet_id" render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Outlet</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl className="rounded-xl bg-muted/20">
                      <SelectTrigger><SelectValue placeholder="Assign to outlet" /></SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {outlets.map(o => (
                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="pin" render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Login PIN (4-6 digits)</FormLabel>
                  <FormControl>
                    <Input maxLength={6} placeholder="1234" className="rounded-xl bg-muted/20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="password" render={({ field }: any) => (
                <FormItem>
                  <FormLabel>{isEdit ? 'New Password' : 'Password'}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" className="rounded-xl bg-muted/20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="password_confirmation" render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" className="rounded-xl bg-muted/20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="is_active" render={({ field }: any) => (
              <FormItem className="flex items-center space-x-3 space-y-0 pt-2 border-t border-border/40">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal text-muted-foreground">Account is Active</FormLabel>
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? 'Saving...' : 'Save User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
