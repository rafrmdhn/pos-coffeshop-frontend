import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { type Transaction } from '@/types/api'

interface TransactionDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
  onVoid: (id: string, notes: string) => Promise<void>
}

export function TransactionDetailDialog({ open, onOpenChange, transaction, onVoid }: TransactionDetailDialogProps) {
  const [voidMode, setVoidMode] = React.useState(false)
  const [voidNotes, setVoidNotes] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setVoidMode(false)
      setVoidNotes("")
    }
  }, [open, transaction])

  if (!transaction) return null

  const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(val)
  const formatDate = (dateStr?: string | null) => dateStr ? new Date(dateStr).toLocaleString("id-ID") : "-"

  const handleVoid = async () => {
    if (voidNotes.length < 5) return alert("Please provide a valid reason (min 5 characters).")
    try {
      setIsSubmitting(true)
      await onVoid(transaction.id, voidNotes)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-border/40 shadow-xl bg-card rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-lightflex items-center gap-3">
            Transaction: {transaction.receipt_number}
            <Badge variant={transaction.status === 'completed' ? 'default' : 'destructive'} className="ml-3 uppercase">
              {transaction.status}
            </Badge>
          </DialogTitle>
          <DialogDescription className="font-light text-muted-foreground flex justify-between">
            <span>{formatDate(transaction.created_at)}</span>
            <span className="capitalize">{transaction.order_type.replace('_', ' ')}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="bg-muted/20 p-4 rounded-xl border border-border/40">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Items</h3>
            <div className="space-y-3">
              {transaction.items?.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div>
                    <div className="font-medium text-foreground">{item.product_name}</div>
                    <div className="text-muted-foreground text-xs">{item.quantity} x {formatCurrency(item.unit_price)}</div>
                  </div>
                  <div className="font-semibold text-foreground">{formatCurrency(item.subtotal)}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border/40 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(transaction.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(transaction.tax_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-destructive">-{formatCurrency(transaction.discount_amount || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border/40 text-foreground">
                <span>Grand Total</span>
                <span className="text-primary">{formatCurrency(transaction.grand_total)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-muted/20 p-4 rounded-xl border border-border/40">
              <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Payment Method</div>
              <div className="font-semibold capitalize text-foreground">{transaction.payment_method}</div>
            </div>
            <div className="bg-muted/20 p-4 rounded-xl border border-border/40">
              <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Cashier</div>
              <div className="font-semibold text-foreground">{transaction.user_id}</div>
            </div>
          </div>

          {transaction.notes && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 text-sm">
              <span className="font-bold">Void Reason:</span> {transaction.notes}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          {!voidMode ? (
            <div className="flex justify-between w-full">
              {transaction.status === 'completed' ? (
                <Button variant="outline" className="rounded-full border-destructive text-destructive hover:bg-destructive hover:text-white" onClick={() => setVoidMode(true)}>
                  Void Transaction
                </Button>
              ) : <div/>}
              <Button type="button" onClick={() => onOpenChange(false)} className="rounded-full bg-primary text-primary-foreground">
                Close
              </Button>
            </div>
          ) : (
            <div className="w-full space-y-4 animate-in slide-in-from-bottom-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-destructive">Reason for voiding:</label>
                <Input 
                  value={voidNotes} 
                  onChange={e => setVoidNotes(e.target.value)} 
                  placeholder="e.g. Customer cancelled order, Input mistake"
                  className="rounded-xl border-destructive/50"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setVoidMode(false)} className="rounded-full">Cancel</Button>
                <Button variant="destructive" disabled={isSubmitting || voidNotes.length < 5} onClick={handleVoid} className="rounded-full bg-destructive text-white border-0">
                  {isSubmitting ? "Voiding..." : "Confirm Void"}
                </Button>
              </div>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
