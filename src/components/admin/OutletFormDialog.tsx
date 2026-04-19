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
import { type Outlet } from '@/types/api'

const TIMEZONES = [
  'Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura',
  'Asia/Singapore', 'UTC',
]

interface OutletFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  outlet?: Outlet | null
  onSubmit: (data: Partial<Outlet>) => Promise<void>
}

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  tax_id: z.string().optional(),
  timezone: z.string().min(1, 'Timezone is required'),
  receipt_header: z.string().optional(),
  receipt_footer: z.string().optional(),
  is_active: z.boolean().default(true),
})

type FormValues = z.infer<typeof schema>

export function OutletFormDialog({ open, onOpenChange, outlet, onSubmit }: OutletFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: outlet?.name || '',
      address: outlet?.address || '',
      phone: outlet?.phone || '',
      tax_id: outlet?.tax_id || '',
      timezone: outlet?.timezone || 'Asia/Jakarta',
      receipt_header: outlet?.receipt_header || '',
      receipt_footer: outlet?.receipt_footer || '',
      is_active: outlet?.is_active ?? true,
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: outlet?.name || '',
        address: outlet?.address || '',
        phone: outlet?.phone || '',
        tax_id: outlet?.tax_id || '',
        timezone: outlet?.timezone || 'Asia/Jakarta',
        receipt_header: outlet?.receipt_header || '',
        receipt_footer: outlet?.receipt_footer || '',
        is_active: outlet?.is_active ?? true,
      })
    }
  }, [outlet, open, form])

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)
      await onSubmit(values)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] border-border/40 shadow-xl bg-card rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light">
            {outlet ? 'Edit Outlet' : 'Create Outlet'}
          </DialogTitle>
          <DialogDescription className="font-light text-muted-foreground">
            Configure outlet details, timezone, and receipt text.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 pt-4">
            <FormField control={form.control} name="name" render={({ field }: any) => (
              <FormItem>
                <FormLabel>Outlet Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Kopi Nusantara Pusat" className="rounded-xl bg-muted/20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="phone" render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="021-555xxxx" className="rounded-xl bg-muted/20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="tax_id" render={({ field }: any) => (
                <FormItem>
                  <FormLabel>NPWP (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="xx.xxx.xxx.x-xxx.xxx" className="rounded-xl bg-muted/20 font-mono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="address" render={({ field }: any) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Full address" className="rounded-xl bg-muted/20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="timezone" render={({ field }: any) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <select
                  {...field}
                  className="w-full h-10 px-3 py-2 rounded-xl bg-muted/20 border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="receipt_header" render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Receipt Header</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={3}
                      placeholder="Text printed on top of receipt"
                      className="w-full px-3 py-2 rounded-xl bg-muted/20 border border-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="receipt_footer" render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Receipt Footer</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={3}
                      placeholder="Text printed on bottom of receipt"
                      className="w-full px-3 py-2 rounded-xl bg-muted/20 border border-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </FormControl>
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="is_active" render={({ field }: any) => (
              <FormItem className="flex items-center space-x-3 space-y-0 pt-2 border-t border-border/40">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal text-muted-foreground">Outlet is Active</FormLabel>
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? 'Saving...' : 'Save Outlet'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
