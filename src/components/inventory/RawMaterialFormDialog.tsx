import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type RawMaterial } from '@/types/api'

interface RawMaterialFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  material?: RawMaterial | null
  onSubmit: (data: Partial<RawMaterial>) => Promise<void>
}

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  unit: z.enum(["gram", "ml", "pcs", "kg", "liter"]),
  current_stock: z.coerce.number().min(0),
  min_stock: z.coerce.number().min(0),
  cost_per_unit: z.coerce.number().min(0),
})

export function RawMaterialFormDialog({ open, onOpenChange, material, onSubmit }: RawMaterialFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: material?.name || "",
      unit: (material?.unit as any) || "gram",
      current_stock: material?.current_stock || 0,
      min_stock: material?.min_stock || 1000,
      cost_per_unit: material?.cost_per_unit || 0,
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: material?.name || "",
        unit: (material?.unit as any) || "gram",
        current_stock: material?.current_stock || 0,
        min_stock: material?.min_stock || 1000,
        cost_per_unit: material?.cost_per_unit || 0,
      })
    }
  }, [material, open, form])

  const handleSubmit = async (values: z.infer<typeof schema>) => {
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
      <DialogContent className="sm:max-w-[450px] border-border/40 shadow-xl bg-card rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light">
            {material ? "Edit Ingredient" : "Add Ingredient"}
          </DialogTitle>
          <DialogDescription className="font-light text-muted-foreground">
            Manage your raw materials to track COGS accurately.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-4">
            <FormField control={form.control} name="name" render={({ field }: any) => (
              <FormItem>
                <FormLabel className="text-foreground/80">Ingredient Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Arabica Beans" className="rounded-xl bg-muted/20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="unit" render={({ field }: any) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Unit of Measurement</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl className="rounded-xl bg-muted/20">
                      <SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="gram">Gram (g)</SelectItem>
                      <SelectItem value="kg">Kilogram (kg)</SelectItem>
                      <SelectItem value="ml">Milliliter (ml)</SelectItem>
                      <SelectItem value="liter">Liter (l)</SelectItem>
                      <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="cost_per_unit" render={({ field }: any) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Cost per Unit (Rp)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" className="rounded-xl bg-muted/20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="current_stock" render={({ field }: any) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Current Stock</FormLabel>
                  <FormControl>
                    <Input type="number" className="rounded-xl bg-muted/20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="min_stock" render={({ field }: any) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Minimum Stock</FormLabel>
                  <FormControl>
                    <Input type="number" className="rounded-xl bg-muted/20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? "Saving..." : "Save Ingredient"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
