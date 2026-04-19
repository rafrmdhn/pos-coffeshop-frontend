import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { type Product, type Category } from '@/types/api'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  categories: Category[]
  onSubmit: (data: Partial<Product>) => Promise<void>
}

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category_id: z.string().min(1, "Category is required"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  sku: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  track_stock: z.boolean().default(true),
})

export function ProductFormDialog({ open, onOpenChange, product, categories, onSubmit }: ProductFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: product?.name || "",
      category_id: product?.category_id || "",
      price: product?.price || 0,
      sku: product?.sku || "",
      description: product?.description || "",
      is_active: product?.is_active ?? true,
      track_stock: product?.track_stock ?? true,
    },
  })

  // Reset form when product changes
  React.useEffect(() => {
    if (open) {
      form.reset({
        name: product?.name || "",
        category_id: product?.category_id || "",
        price: product?.price || 0,
        sku: product?.sku || "",
        description: product?.description || "",
        is_active: product?.is_active ?? true,
        track_stock: product?.track_stock ?? true,
      })
    }
  }, [product, open, form])

  const onSubmitFn = async (values: z.infer<typeof productSchema>) => {
    try {
      setIsSubmitting(true)
      await onSubmit(values)
      onOpenChange(false)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-border/40 shadow-xl bg-card rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light text-foreground">
            {product ? "Edit Menu Item" : "Add Menu Item"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-light">
            Fill in the details for the menu offering.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitFn)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Caramel Macchiato" className="rounded-xl bg-muted/20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl className="rounded-xl bg-muted/20">
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Price (IDR)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="25000" className="rounded-xl bg-muted/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sku"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">SKU Code (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. ESP-MAC-01" className="rounded-xl bg-muted/20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-8 pt-2 pb-4">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }: any) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Available for Sale</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="track_stock"
                render={({ field }: any) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Track Ingredients (BOM)</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? "Saving..." : "Save Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
