import React from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Eye } from 'lucide-react'
import { type Transaction } from '@/services/operationalService'
import { operationalService } from '@/services/operationalService'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TransactionDetailDialog } from '@/components/operational/TransactionDetailDialog'

export default function TransactionHistoryPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectedTx, setSelectedTx] = React.useState<Transaction | null>(null)

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => operationalService.getTransactions(),
  })

  const voidMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string, notes: string }) => operationalService.voidTransaction(id, notes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] })
  })

  const handleVoidSubmit = async (id: string, notes: string) => {
    await voidMutation.mutateAsync({ id, notes })
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(val)
  const formatDate = (dateStr?: string | null) => dateStr ? new Date(dateStr).toLocaleString("id-ID") : "-"

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "receipt_number",
      header: "Receipt #",
      cell: ({ row }) => <div className="font-mono font-medium text-foreground">{row.getValue("receipt_number")}</div>,
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => <div className="text-muted-foreground">{formatDate(row.getValue("created_at"))}</div>,
    },
    {
      accessorKey: "order_type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("order_type") as string
        return <Badge variant="outline" className="capitalize bg-muted/20 border-border">{type.replace('_', ' ')}</Badge>
      },
    },
    {
      accessorKey: "grand_total",
      header: "Total",
      cell: ({ row }) => <div className="font-semibold text-right text-foreground">{formatCurrency(row.getValue("grand_total"))}</div>,
    },
    {
      accessorKey: "payment_method",
      header: "Payment",
      cell: ({ row }) => <div className="text-muted-foreground text-center uppercase text-xs font-bold tracking-wider">{row.getValue("payment_method")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status")
        return (
          <Badge variant={status === 'completed' ? "default" : "destructive"} className={status === 'completed' ? "bg-success/20 text-success border-0" : "uppercase"}>
            {status as string}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const tx = row.original
        return (
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" size="sm" 
              className="text-primary hover:text-primary rounded-full hover:bg-primary/10"
              onClick={() => { setSelectedTx(tx); setDialogOpen(true) }}
            >
              <Eye className="h-4 w-4 mr-2" /> Detail
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="p-8 pb-12 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-light text-foreground tracking-tight">Transactions</h1>
          <p className="text-muted-foreground font-light mt-1 text-lg">History of all POS completed orders.</p>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border/40 p-6 rounded-[2rem] shadow-sm">
        <DataTable 
          columns={columns} 
          data={transactionsData?.data || []} 
          isLoading={isLoading}
          searchKey="receipt_number"
          searchPlaceholder="Search Receipt ID..."
          emptyMessage="No transactions found."
        />
      </div>

      <TransactionDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={selectedTx as any}
        onVoid={handleVoidSubmit}
      />
    </div>
  )
}
