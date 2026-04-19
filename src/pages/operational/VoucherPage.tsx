import React from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { type Voucher } from '@/services/operationalService'
import { operationalService } from '@/services/operationalService'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VoucherFormDialog } from '@/components/operational/VoucherFormDialog'

export default function VoucherPage() {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = React.useState(false)
  const [selectedVoucher, setSelectedVoucher] = React.useState<Voucher | null>(null)

  const { data: vouchersData, isLoading } = useQuery({
    queryKey: ['vouchers'],
    queryFn: () => operationalService.getVouchers(),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Voucher>) => operationalService.createVoucher(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vouchers'] })
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Voucher> }) => operationalService.updateVoucher(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vouchers'] })
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => operationalService.deleteVoucher(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vouchers'] })
  })

  const handleFormSubmit = async (data: Partial<Voucher>) => {
    if (selectedVoucher) {
      await updateMutation.mutateAsync({ id: selectedVoucher.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const handleDelete = (voucher: Voucher) => {
    if (window.confirm(`Are you sure you want to delete ${voucher.code}?`)) {
      deleteMutation.mutate(voucher.id)
    }
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(val)

  const columns: ColumnDef<Voucher>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <div className="font-mono font-bold text-foreground">{row.getValue("code")}</div>,
    },
    {
      accessorKey: "name",
      header: "Promo Name",
      cell: ({ row }) => <div className="font-medium text-muted-foreground">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "discount_value",
      header: "Discount",
      cell: ({ row }) => {
        const type = row.original.discount_type
        const val = parseFloat(row.getValue("discount_value") as string)
        return (
          <div className="text-secondary font-semibold">
            {type === 'percentage' ? `${val}% OFF` : formatCurrency(val)}
          </div>
        )
      },
    },
    {
      accessorKey: "used_count",
      header: "Uses",
      cell: ({ row }) => <div className="text-muted-foreground text-center">{row.getValue("used_count")}x</div>,
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active")
        return (
          <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-success/20 text-success border-0" : "opacity-50"}>
            {isActive ? "ACTIVE" : "DISABLED"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const voucher = row.original
        return (
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" size="icon" 
              className="text-muted-foreground hover:text-primary rounded-full"
              onClick={() => { setSelectedVoucher(voucher); setFormOpen(true) }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" size="icon" 
              className="text-muted-foreground hover:text-destructive rounded-full"
              onClick={() => handleDelete(voucher)}
            >
              <Trash2 className="h-4 w-4" />
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
          <h1 className="text-4xl font-serif font-light text-foreground tracking-tight">Vouchers</h1>
          <p className="text-muted-foreground font-light mt-1 text-lg">Manage promo codes and discounts.</p>
        </div>
        <Button 
          onClick={() => { setSelectedVoucher(null); setFormOpen(true) }}
          className="rounded-full shadow-md bg-primary hover:bg-primary/90 text-primary-foreground pl-4 pr-6"
        >
          <Plus className="mr-2 h-4 w-4" /> Create Voucher
        </Button>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border/40 p-6 rounded-[2rem] shadow-sm">
        <DataTable 
          columns={columns} 
          data={vouchersData?.data || []} 
          isLoading={isLoading}
          searchKey="code"
          searchPlaceholder="Search voucher code..."
          emptyMessage="No vouchers found."
        />
      </div>

      <VoucherFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        voucher={selectedVoucher as any}
        onSubmit={handleFormSubmit as any}
      />
    </div>
  )
}
