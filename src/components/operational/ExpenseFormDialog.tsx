import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type Expense } from '@/types/api'

interface ExpenseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: Expense | null
  onSubmit: (data: Partial<Expense>) => Promise<void>
}

const expenseCategories = ["salary", "rent", "utilities", "supplies", "maintenance", "marketing", "other"] as const;

const schema = z.object({
  category: z.enum(expenseCategories),
  expense_date: z.string().min(1, "Date is required"),
  description: z.string().min(2, "Description is required"),
  amount: z.coerce.number().min(1, "Amount must be greater than zero"),
  reference_number: z.string().optional(),
})

export function ExpenseFormDialog({ open, onOpenChange, expense, onSubmit }: ExpenseFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      category: (expense?.category as any) || "other",
      expense_date: expense?.date || new Date().toISOString().split('T')[0],
      description: expense?.description || "",
      amount: expense?.amount || 0,
      reference_number: expense?.reference_number || "",
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        category: (expense?.category as any) || "other",
        expense_date: expense?.date || new Date().toISOString().split('T')[0],
        description: expense?.description || "",
        amount: expense?.amount || 0,
        reference_number: expense?.reference_number || "",
      })
    }
  }, [expense, open, form])

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    try {
      setIsSubmitting(true)
      await onSubmit(values as any)
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
            {expense ? "Edit Expense" : "Record Expense"}
          </DialogTitle>
          <DialogDescription className="font-light text-muted-foreground">
            Track operational costs and outgoings.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="expense_date" render={({ field }: any) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Date</FormLabel>
                  <FormControl>
                    <Input type="date" className="rounded-xl bg-muted/20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="category" render={({ field }: any) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl className="rounded-xl bg-muted/20">
                      <SelectTrigger className="capitalize"><SelectValue placeholder="Select Category" /></SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {expenseCategories.map(cat => <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }: any) => (
              <FormItem>
                <FormLabel className="text-foreground/80">Description</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Listrik PLN" className="rounded-xl bg-muted/20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="amount" render={({ field }: any) => (
              <FormItem>
                <FormLabel className="text-foreground/80">Amount (IDR)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter amount" className="rounded-xl bg-muted/20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="reference_number" render={({ field }: any) => (
              <FormItem>
                <FormLabel className="text-foreground/80">Reference / Receipt Number (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. REC-123456" className="rounded-xl bg-muted/20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? "Saving..." : "Save Expense"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
