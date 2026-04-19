import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCartStore } from "@/stores/cartStore"
import { useState } from "react"
import { Banknote, QrCode, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { toast } from 'sonner'
import { transactionService } from "@/services/operationalService"
import { db } from "@/lib/db"

export function PaymentDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { items, orderType, grandTotal, clearCart } = useCartStore()
  const [method, setMethod] = useState<'cash'|'qris'>('cash')
  const [isProcessing, setIsProcessing] = useState(false)

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const handleProcess = async () => {
    setIsProcessing(true);
    const txId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tx-${Date.now()}`;
    
    const apiPayload = {
       id: txId, // provide client-side ID for syncing
       order_type: orderType,
       items: items.map(i => ({
         product_id: i.id,
         quantity: i.qty,
         notes: i.notes || null
       })),
       payments: [{
         payment_method: method,
         amount: grandTotal,
         cash_received: method === 'cash' ? grandTotal : null // Simplified cashier flow
       }],
       source: (navigator.onLine ? 'online' : 'offline') as 'online' | 'offline',
       transaction_date: new Date().toISOString()
    }

    try {
      if (!navigator.onLine) {
         await db.offlineTransactions.add({
           id: txId,
           payload: apiPayload,
           status: 'pending',
           created_at: new Date().toISOString()
         })

         toast.success('Disimpan secara Luring', {
          icon: <CheckCircle2 className="text-warning" />,
          description: `Koneksi terputus. Transaksi ${method.toUpperCase()} masuk ke antrean.`
        })
      } else {
         await transactionService.createTransaction(apiPayload);
         toast.success('Transaksi Berhasil Dicatat', {
          icon: <CheckCircle2 className="text-success" />,
          description: `Pembayaran ${method.toUpperCase()} selesai diproses ke Server.`
        })
      }
      
      clearCart();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Payment Error:', error);
      toast.error('Gagal Memproses Transaksi', {
        icon: <AlertCircle />,
        description: error?.message || 'Terjadi kesalahan saat menghubungi server.'
      })
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background border-border/50 rounded-3xl">
        <DialogHeader className="p-8 pb-6 bg-muted/20 border-b border-border/50">
          <DialogTitle className="font-serif text-3xl tracking-tight text-center">Proses Checkout</DialogTitle>
          <div className="text-center mt-4">
             <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase mb-1">Total Tagihan</p>
             <h2 className="text-5xl font-sans font-bold tracking-tighter text-primary border-b-4 border-primary/20 inline-block pb-2">{formatIDR(grandTotal)}</h2>
          </div>
        </DialogHeader>
        
        <div className="p-8">
          {/* Payment Method Selector */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              onClick={() => setMethod('cash')}
              className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all active:scale-95 ${method === 'cash' ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-border/60 hover:border-border text-muted-foreground bg-muted/10'}`}
            >
              <Banknote size={36} strokeWidth={2} className="mb-3" />
              <span className="font-bold tracking-tight text-sm">TUNAI</span>
            </button>
            <button 
              onClick={() => setMethod('qris')}
              className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all active:scale-95 ${method === 'qris' ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-border/60 hover:border-border text-muted-foreground bg-muted/10'}`}
            >
              <QrCode size={36} strokeWidth={2} className="mb-3" />
              <span className="font-bold tracking-tight text-sm">QRIS</span>
            </button>
          </div>

          <button 
             onClick={handleProcess}
             disabled={isProcessing}
             className="w-full h-16 bg-primary text-primary-foreground rounded-full font-bold text-xl tracking-tight hover:opacity-90 active:scale-[0.98] transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Processing...
              </>
            ) : (
              'Selesaikan Transaksi'
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
