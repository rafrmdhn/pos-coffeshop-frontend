import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportService } from '@/services/reportService'
import type { InventoryReportData } from '@/services/reportService'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Boxes, AlertTriangle, Banknote } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { DashboardDateRange } from '@/components/dashboard/DateRangePicker'

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon: Icon, accent, alert,
}: {
  label: string; value: string; sub?: string
  icon: React.ElementType; accent: string; alert?: boolean
}) {
  return (
    <div className={`relative overflow-hidden bg-card/60 backdrop-blur-xl border rounded-[1.5rem] p-6 shadow-sm ${alert ? 'border-destructive/40' : 'border-border/40'}`}>
      <div className={`absolute right-4 top-4 w-10 h-10 rounded-full ${accent}/15 flex items-center justify-center`}>
        <Icon className={`h-5 w-5 ${accent.replace('bg-', 'text-')}`} />
      </div>
      <p className="text-sm text-muted-foreground font-light">{label}</p>
      <p className={`text-3xl font-serif font-light mt-1 ${alert ? 'text-destructive' : 'text-foreground'}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

const fmtRp = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)

type MatRow = NonNullable<InventoryReportData>['materials'][0]

export default function InventoryReportPage() {
  const [lowStockOnly, setLowStockOnly] = React.useState(false)
  const [dateRange, setDateRange] = React.useState({
    from: subDays(new Date(), 30),
    to: new Date()
  })

  const { data: response, isLoading } = useQuery({
    queryKey: ['report-inventory', dateRange],
    queryFn: () => reportService.getInventoryReport({
      date_from: format(dateRange.from, 'yyyy-MM-dd'),
      date_to: format(dateRange.to, 'yyyy-MM-dd'),
    }),
  })

  // Unwrap API envelope
  const data = response?.data
  const s = data?.summary
  const materials = (data?.materials || []).filter(m => !lowStockOnly || m.is_low_stock)

  const columns: ColumnDef<MatRow>[] = [
    {
      accessorKey: 'name',
      header: 'Material',
      cell: ({ row }) => {
        const low = row.original.is_low_stock
        return (
          <div className="flex items-center gap-2">
            {low && <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />}
            <span className={`font-medium ${low ? 'text-destructive' : 'text-foreground'}`}>
              {row.getValue('name')}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'current_stock',
      header: 'Stock',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.getValue<number>('current_stock').toLocaleString('id-ID')} {row.original.unit}
        </span>
      ),
    },
    {
      accessorKey: 'min_stock',
      header: 'Min Stock',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.getValue<number>('min_stock').toLocaleString('id-ID')} {row.original.unit}
        </span>
      ),
    },
    {
      accessorKey: 'cost_per_unit',
      header: 'Cost / Unit',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{fmtRp(row.getValue('cost_per_unit'))}</span>
      ),
    },
    {
      accessorKey: 'total_value',
      header: 'Stock Value',
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">{fmtRp(row.getValue('total_value'))}</span>
      ),
    },
    {
      accessorKey: 'is_low_stock',
      header: 'Status',
      cell: ({ row }) => {
        const low = row.getValue('is_low_stock')
        return low ? (
          <Badge variant="destructive" className="bg-destructive/15 text-destructive border-0 gap-1">
            <AlertTriangle className="h-3 w-3" /> Low Stock
          </Badge>
        ) : (
          <Badge variant="default" className="bg-success/15 text-success border-0">OK</Badge>
        )
      },
    },
  ]

  return (
    <div className="p-8 pb-16 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary/70 uppercase tracking-widest mb-1">Reports</p>
          <h1 className="text-4xl font-serif font-light text-foreground tracking-tight">Inventory Report</h1>
          <p className="text-muted-foreground font-light mt-1 text-lg">Material stock levels and total inventory value.</p>
        </div>
        <DashboardDateRange 
          from={dateRange.from} 
          to={dateRange.to} 
          onChange={setDateRange} 
        />
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-[1.5rem]" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard label="Total Materials" value={String(s?.total_materials ?? 0)} sub="Active raw materials" icon={Boxes} accent="bg-primary" />
          <KpiCard label="Low Stock Alerts" value={String(s?.low_stock_count ?? 0)} sub="Items below minimum level" icon={AlertTriangle} accent="bg-destructive" alert={(s?.low_stock_count ?? 0) > 0} />
          <KpiCard label="Total Inventory Value" value={fmtRp(s?.total_stock_value ?? 0)} sub="Based on current stock × cost" icon={Banknote} accent="bg-success" />
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={e => setLowStockOnly(e.target.checked)}
            className="rounded accent-primary w-4 h-4"
          />
          <span className="text-sm font-medium text-foreground">Show low-stock items only</span>
        </label>
        {lowStockOnly && (
          <span className="text-xs bg-destructive/10 text-destructive px-3 py-1 rounded-full">
            {materials.length} item{materials.length !== 1 ? 's' : ''} need restocking
          </span>
        )}
      </div>

      {/* Materials Table */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/40 p-6 rounded-[2rem] shadow-sm">
        <DataTable
          columns={columns}
          data={materials}
          isLoading={isLoading}
          searchKey="name"
          searchPlaceholder="Search material name..."
          emptyMessage="No materials found."
        />
      </div>
    </div>
  )
}
