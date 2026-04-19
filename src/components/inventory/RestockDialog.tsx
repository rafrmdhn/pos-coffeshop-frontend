import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { type RawMaterial } from '@/types/api'

interface RestockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  material: RawMaterial | null
  onSubmit: (id: string, additionalStock: number) => Promise<void>
}

const schema = z.object({
  additional_stock: z.coerce.number().min(0.01, "Amount must be greater than zero"),
})

export function RestockDialog({ open, onOpenChange, material, onSubmit }: RestockDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema) as any,
    defaultValues: { additional_stock: 0 },
  })

  React.useEffect(() => {
    if (open) form.reset({ additional_stock: 0 })
  }, [open, form])

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    if (!material) return
    try {
      setIsSubmitting(true)
      await onSubmit(material.id, values.additional_stock)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!material) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] border-border/40 shadow-xl bg-card rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light">Inventory Restock</DialogTitle>
          <DialogDescription className="font-light text-muted-foreground">
            Add new stock for <strong className="text-foreground">{material.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-2">
            <div className="bg-muted/30 p-4 rounded-xl flex justify-between items-center text-sm border border-border/40">
              <span className="text-muted-foreground">Current Stock</span>
              <span className="font-medium text-foreground">{material.current_stock} {material.unit}</span>
            </div>

            <FormField control={form.control} name="additional_stock" render={({ field }: any) => (
              <FormItem>
                <FormLabel className="text-foreground/80">Received Quantity ({material.unit})</FormLabel>
                <FormControl>
                  <Input type="number" step="any" placeholder="0" className="rounded-xl bg-muted/20 text-lg py-6" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? "Processing..." : "Confirm Restock"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
