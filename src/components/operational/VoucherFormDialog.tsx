import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { type Voucher } from '@/types/api'

interface VoucherFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  voucher?: Voucher | null
  onSubmit: (data: Partial<Voucher>) => Promise<void>
}

const schema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
  name: z.string().min(2, "Name is required"),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.coerce.number().min(1, "Value must be greater than zero"),
  min_purchase: z.coerce.number().optional(),
  max_discount: z.coerce.number().optional(),
  is_active: z.boolean().default(true),
})

export function VoucherFormDialog({ open, onOpenChange, voucher, onSubmit }: VoucherFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      code: voucher?.code || "",
      name: voucher?.name || "",
      discount_type: (voucher?.discount_type as any) || "percentage",
      discount_value: voucher?.discount_value || 0,
      min_purchase: voucher?.min_purchase || 0,
      max_discount: voucher?.max_discount || 0,
      is_active: voucher?.is_active ?? true,
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        code: voucher?.code || "",
        name: voucher?.name || "",
        discount_type: (voucher?.discount_type as any) || "percentage",
        discount_value: voucher?.discount_value || 0,
        min_purchase: voucher?.min_purchase || 0,
        max_discount: voucher?.max_discount || 0,
        is_active: voucher?.is_active ?? true,
      })
    }
  }, [voucher, open, form])

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    try {
      setIsSubmitting(true)
      await onSubmit(values)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const discountType = form.watch("discount_type")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-border/40 shadow-xl bg-card rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light">
            {voucher ? "Edit Voucher" : "Create Voucher"}
          </DialogTitle>
          <DialogDescription className="font-light text-muted-foreground">
            Configure promotional codes and discounts.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="code" render={({ field }: any) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. WELCOME20" className="rounded-xl bg-muted/20 uppercase font-mono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="name" render={({ field }: any) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Promo Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. New User Promo" className="rounded-xl bg-muted/20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="discount_type" render={({ field }: any) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Discount Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl className="rounded-xl bg-muted/20">
                      <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (Rp)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="discount_value" render={({ field }: any) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Value</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 20" className="rounded-xl bg-muted/20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="min_purchase" render={({ field }: any) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Min Purchase (Rp)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0 = None" className="rounded-xl bg-muted/20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {discountType === 'percentage' && (
                <FormField control={form.control} name="max_discount" render={({ field }: any) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Max Discount (Rp)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0 = No Limit" className="rounded-xl bg-muted/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </div>

            <FormField control={form.control} name="is_active" render={({ field }: any) => (
              <FormItem className="flex items-center space-x-2 space-y-0 pt-2 pb-4 border-t border-border/40 mt-4 pt-6">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal text-muted-foreground">Voucher is Active</FormLabel>
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? "Saving..." : "Save Voucher"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
