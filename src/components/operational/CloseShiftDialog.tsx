import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Banknote, Coins, Calculator } from 'lucide-react'

interface CloseShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (counts: { denomination: number; qty: number }[]) => Promise<void>
}

const DENOMINATIONS = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100]

export function CloseShiftDialog({ open, onOpenChange, onSubmit }: CloseShiftDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [counts, setCounts] = React.useState<Record<number, number>>(
    DENOMINATIONS.reduce((acc, d) => ({ ...acc, [d]: 0 }), {})
  )

  React.useEffect(() => {
    if (open) {
      setCounts(DENOMINATIONS.reduce((acc, d) => ({ ...acc, [d]: 0 }), {}))
    }
  }, [open])

  const total = DENOMINATIONS.reduce((sum, d) => sum + (d * (counts[d] || 0)), 0)

  const handleQtyChange = (denom: number, val: string) => {
    const qty = parseInt(val) || 0
    setCounts(prev => ({ ...prev, [denom]: qty }))
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const payload = DENOMINATIONS.map(d => ({
        denomination: d,
        qty: counts[d] || 0
      })).filter(c => c.qty > 0)
      
      // Still send at least one 0 count if everything is 0 to avoid empty array if required
      await onSubmit(payload.length > 0 ? payload : [{ denomination: 100, qty: 0 }])
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-border/40 shadow-xl bg-card rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-serif text-2xl font-light">Blind Drop Cash Count</DialogTitle>
          <DialogDescription className="font-light text-muted-foreground">
            Report the physical cash count in your drawer per denomination.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col">
          <div className="px-6 py-4 border-b border-border/30 bg-muted/5">
            <ScrollArea className="h-full max-h-[40vh] min-h-[300px]">
              <div className="space-y-3 pr-4">
                {DENOMINATIONS.map((denom) => (
                  <div key={denom} className="flex items-center justify-between gap-4 p-3 bg-muted/10 rounded-xl border border-border/30">
                    <div className="flex items-center gap-3 w-32 shrink-0">
                      {denom >= 1000 ? <Banknote size={18} className="text-primary/60" /> : <Coins size={18} className="text-primary/60" />}
                      <span className="font-sans font-semibold text-sm">{formatCurrency(denom)}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-muted-foreground text-xs">×</span>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder="0"
                        value={counts[denom] || ''}
                        onChange={(e) => handleQtyChange(denom, e.target.value)}
                        className="h-9 rounded-lg bg-background text-right font-mono"
                      />
                    </div>
                    <div className="w-24 text-right font-sans font-bold text-sm text-foreground/80 shrink-0">
                      {formatCurrency(denom * (counts[denom] || 0))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          <div className="p-6 bg-muted/20 border-t border-border/50">
             <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                   <Calculator size={18} />
                   <span className="text-sm font-medium">Total Cash Count</span>
                </div>
                <span className="text-2xl font-sans font-bold text-primary tracking-tighter">
                   {formatCurrency(total)}
                </span>
             </div>

             <DialogFooter className="gap-2 sm:gap-0">
               <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
                 Cancel
               </Button>
               <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting} 
                variant="destructive" 
                className="rounded-full px-8 shadow-md border-0 bg-destructive hover:bg-destructive/90 text-white font-bold"
               >
                 {isSubmitting ? "Closing..." : "Confirm & Close Shift"}
               </Button>
             </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
