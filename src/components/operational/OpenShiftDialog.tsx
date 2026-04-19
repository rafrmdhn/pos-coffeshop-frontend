import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface OpenShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (startingCash: number) => Promise<void>
}

const schema = z.object({
  starting_cash: z.coerce.number().min(0, "Subtotal cannot be negative"),
})

export function OpenShiftDialog({ open, onOpenChange, onSubmit }: OpenShiftDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema) as any,
    defaultValues: { starting_cash: 0 },
  })

  React.useEffect(() => {
    if (open) form.reset({ starting_cash: 0 })
  }, [open, form])

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    try {
      setIsSubmitting(true)
      await onSubmit(values.starting_cash)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-border/40 shadow-xl bg-card rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light">Open Cashier Shift</DialogTitle>
          <DialogDescription className="font-light text-muted-foreground">
            Enter the starting cash amount in the drawer to begin calculations.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-4">
            <FormField control={form.control} name="starting_cash" render={({ field }: any) => (
              <FormItem>
                <FormLabel className="text-foreground/80">Starting Cash (IDR)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter amount" className="rounded-xl bg-muted/20 text-lg py-6" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 shadow-md">
                {isSubmitting ? "Starting..." : "Start Shift"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
