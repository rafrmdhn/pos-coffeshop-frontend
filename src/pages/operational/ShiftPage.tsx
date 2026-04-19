import React from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Coffee, DoorClosed } from 'lucide-react'
import { type Shift, operationalService, shiftService } from '@/services/operationalService'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OpenShiftDialog } from '@/components/operational/OpenShiftDialog'
import { CloseShiftDialog } from '@/components/operational/CloseShiftDialog'

export default function ShiftPage() {
  const queryClient = useQueryClient()
  const [openShiftOpen, setOpenShiftOpen] = React.useState(false)
  const [closeShiftOpen, setCloseShiftOpen] = React.useState(false)

  const { data: shiftsData, isLoading } = useQuery({
    queryKey: ['shifts'],
    queryFn: () => operationalService.getShifts(),
  })

  const { data: activeShiftData } = useQuery({
    queryKey: ['active-shift'],
    queryFn: () => operationalService.getActiveShift(),
  })
  
  const activeShift = activeShiftData?.data

  const openMutation = useMutation({
    mutationFn: (startingCash: number) => operationalService.openShift(startingCash),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
      queryClient.invalidateQueries({ queryKey: ['active-shift'] })
    }
  })

  const closeMutation = useMutation({
    mutationFn: (counts: { denomination: number; qty: number }[]) => 
      shiftService.closeShift({ counts }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
      queryClient.invalidateQueries({ queryKey: ['active-shift'] })
    }
  })

  const handleOpenShift = async (startingCash: number) => {
    await openMutation.mutateAsync(startingCash)
  }

  const handleCloseShift = async (counts: { denomination: number; qty: number }[]) => {
    await closeMutation.mutateAsync(counts)
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(val)
  const formatDate = (dateStr?: string | null) => dateStr ? new Date(dateStr).toLocaleString("id-ID") : "-"

  const columns: ColumnDef<Shift>[] = [
    {
      accessorKey: "opened_at",
      header: "Opened At",
      cell: ({ row }) => <div className="font-medium text-foreground">{formatDate(row.getValue("opened_at"))}</div>,
    },
    {
      accessorKey: "closed_at",
      header: "Closed At",
      cell: ({ row }) => <div className="text-muted-foreground">{formatDate(row.getValue("closed_at"))}</div>,
    },
    {
      accessorKey: "opening_cash",
      header: "Starting Cash",
      cell: ({ row }) => <div className="text-foreground">{formatCurrency(row.getValue("opening_cash"))}</div>,
    },
    {
      accessorKey: "cash_difference",
      header: "Difference",
      cell: ({ row }) => {
        const diff = parseFloat(row.getValue("cash_difference") || "0")
        const color = diff === 0 ? "text-success" : diff > 0 ? "text-success" : "text-destructive"
        return diff !== undefined ? <div className={`font-semibold ${color}`}>{diff > 0 ? '+' : ''}{formatCurrency(diff)}</div> : <div>-</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status")
        return (
          <Badge variant={status === 'open' ? "default" : "secondary"} className={status === 'open' ? "bg-success/20 text-success border-0" : "opacity-50"}>
            {status === 'open' ? "ACTIVE" : "CLOSED"}
          </Badge>
        )
      },
    },
  ]

  return (
    <div className="p-8 pb-12 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-light text-foreground tracking-tight">Shift Management</h1>
          <p className="text-muted-foreground font-light mt-1 text-lg">Monitor active shifts and cash counts.</p>
        </div>
        <div>
          {activeShift ? (
            <Button 
              onClick={() => setCloseShiftOpen(true)}
              variant="destructive"
              className="rounded-full shadow-md bg-destructive hover:bg-destructive/90 text-white pl-4 pr-6"
            >
              <DoorClosed className="mr-2 h-4 w-4" /> Close Active Shift
            </Button>
          ) : (
            <Button 
              onClick={() => setOpenShiftOpen(true)}
              className="rounded-full shadow-md bg-primary hover:bg-primary/90 text-primary-foreground pl-4 pr-6"
            >
              <Coffee className="mr-2 h-4 w-4" /> Open New Shift
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border/40 p-6 rounded-[2rem] shadow-sm">
        <DataTable 
          columns={columns} 
          data={shiftsData?.data || []} 
          isLoading={isLoading}
          emptyMessage="No shift records found."
        />
      </div>

      <OpenShiftDialog open={openShiftOpen} onOpenChange={setOpenShiftOpen} onSubmit={handleOpenShift} />
      <CloseShiftDialog open={closeShiftOpen} onOpenChange={setCloseShiftOpen} onSubmit={handleCloseShift} />
    </div>
  )
}
