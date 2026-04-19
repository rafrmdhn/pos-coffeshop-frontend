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
import { Switch } from '@/components/ui/switch'
import { type Category } from '@/types/api'

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
  onSubmit: (data: Partial<Category>) => Promise<void>
}

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
})

export function CategoryFormDialog({ open, onOpenChange, category, onSubmit }: CategoryFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
      sort_order: category?.sort_order || 0,
      is_active: category?.is_active ?? true,
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: category?.name || "",
        description: category?.description || "",
        sort_order: category?.sort_order || 0,
        is_active: category?.is_active ?? true,
      })
    }
  }, [category, open, form])

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
      <DialogContent className="sm:max-w-[425px] border-border/40 shadow-xl bg-card rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light">
            {category ? "Edit Category" : "Add Category"}
          </DialogTitle>
          <DialogDescription className="font-light text-muted-foreground">
            Organize your menu offerings into intuitive categories.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Pastries" className="rounded-xl bg-muted/20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional details..." className="rounded-xl bg-muted/20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sort_order"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Sort Order</FormLabel>
                  <FormControl>
                    <Input type="number" className="rounded-xl bg-muted/20 w-32" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }: any) => (
                <FormItem className="flex items-center space-x-2 space-y-0 pt-2 pb-4">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">Visible to Customers</FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? "Saving..." : "Save Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
