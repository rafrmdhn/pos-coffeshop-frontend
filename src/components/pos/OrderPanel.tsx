import { useCartStore } from '@/stores/cartStore';
import { Minus, Plus, Trash2, ReceiptText, Utensils, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { PaymentDialog } from './PaymentDialog';

export function OrderPanel() {
  const { items, orderType, subtotal, tax, grandTotal, setOrderType, updateQty, removeItem, clearCart } = useCartStore();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="h-full w-full bg-card flex flex-col border-l border-border/50 backdrop-blur-md">
      {/* Header: Order Type Toggle */}
      <div className="p-4 md:p-5 border-b border-border/50 bg-background/50 z-10 shrink-0">
        <div className="flex bg-muted/40 p-1.5 rounded-full border border-border/40 shadow-inner">
          <button
            onClick={() => setOrderType('dine_in')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 select-none ${orderType === 'dine_in' ? 'bg-background shadow-md text-primary scale-100' : 'text-muted-foreground hover:text-foreground scale-95'}`}
          >
            <Utensils size={18} /> Dine In
          </button>
          <button
            onClick={() => setOrderType('takeaway')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 select-none ${orderType === 'takeaway' ? 'bg-background shadow-md text-primary scale-100' : 'text-muted-foreground hover:text-foreground scale-95'}`}
          >
            <Box size={18} /> Takeaway
          </button>
        </div>
      </div>

      {/* Cart Items List — flex-1 + min-h-0 ensures it shrinks instead of pushing footer away */}
      <ScrollArea className="flex-1 min-h-0 w-full bg-background/30">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 mt-40">
            <ReceiptText size={72} strokeWidth={1} className="mb-6 opacity-30" />
            <p className="font-serif text-xl">Orderan Kosong</p>
            <p className="text-sm font-sans tracking-wide mt-1">Silakan pilih poduk dari menu.</p>
          </div>
        ) : (
          <div className="p-4 md:p-5 space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex flex-col gap-2 p-3.5 bg-background rounded-2xl border border-border/60 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-sans font-bold text-foreground leading-tight text-sm md:text-base">{item.name}</h4>
                    <p className="text-primary font-bold text-sm tracking-tight mt-1">{formatIDR(item.price)}</p>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors active:scale-90">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                {/* Stepper Controls */}
                <div className="flex justify-between items-center mt-2 border-t border-border/40 pt-3">
                  <span className="text-sm font-bold tracking-tight text-foreground/80">{formatIDR(item.price * item.qty)}</span>
                  <div className="flex items-center gap-3 bg-muted/30 rounded-full px-1.5 py-1.5 border border-border/40">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-7 h-7 rounded-full bg-background flex items-center justify-center hover:bg-muted active:scale-90 transition-transform shadow-sm text-foreground">
                      <Minus size={14} strokeWidth={2.5}/>
                    </button>
                    <span className="font-sans font-bold w-5 text-center text-sm">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground active:scale-90 transition-colors shadow-sm">
                      <Plus size={14} strokeWidth={2.5}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer Summary & Payment */}
      <div className="mt-auto bg-card border-t border-border/50 p-5 md:p-6 shrink-0 rounded-t-[2.5rem] shadow-[0_-10px_50px_-15px_rgba(0,0,0,0.15)] z-20 relative">
        <div className="space-y-2 mb-6 px-2">
          <div className="flex justify-between text-sm text-muted-foreground font-semibold">
            <span>Subtotal</span>
            <span>{formatIDR(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground font-semibold">
            <span>Diskon</span>
            <span>Rp 0</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground font-semibold">
            <span>Pajak (PB1 10%)</span>
            <span>{formatIDR(tax)}</span>
          </div>
          <div className="border-t-2 border-dashed border-border/60 my-3 pt-3 flex justify-between items-end">
            <span className="font-serif font-semibold text-xl tracking-tight">Total Akhir</span>
            <span className="font-sans font-bold text-3xl md:text-4xl tracking-tighter text-primary">{formatIDR(grandTotal)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          {items.length > 0 && (
             <Button variant="outline" onClick={clearCart} className="flex-1 h-14 rounded-full font-bold border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive active:scale-95 transition-all text-base">
               Batal
             </Button>
          )}
          <Button 
            disabled={items.length === 0} 
            onClick={() => setIsPaymentOpen(true)}
            className="flex-[2] h-14 rounded-full text-lg font-bold transition-all active:scale-[0.98] animate-in shadow-lg hover:shadow-xl hover:opacity-95"
          >
            Bayar Pesanan
          </Button>
        </div>
      </div>
      
      <PaymentDialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen} />
    </div>
  )
}
