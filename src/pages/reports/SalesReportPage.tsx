import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { reportService } from '@/services/reportService'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, ShoppingCart, BarChart2, CreditCard } from 'lucide-react'
import { useLazyVisible } from '@/hooks/useLazyVisible'
import { format, subDays } from 'date-fns'
import { DashboardDateRange } from '@/components/dashboard/DateRangePicker'

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon: Icon, accent,
}: {
  label: string; value: string; sub?: string; icon: React.ElementType; accent: string
}) {
  return (
    <div className={`relative overflow-hidden bg-card/60 backdrop-blur-xl border border-border/40 rounded-[1.5rem] p-6 shadow-sm`}>
      <div className={`absolute right-4 top-4 w-10 h-10 rounded-full ${accent}/15 flex items-center justify-center`}>
        <Icon className={`h-5 w-5 ${accent.replace('bg-', 'text-')}`} />
      </div>
      <p className="text-sm text-muted-foreground font-light">{label}</p>
      <p className="text-3xl font-serif font-light text-foreground mt-1">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

// ── Tooltip for bar chart ─────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const fmtRp = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)
  return (
    <div className="bg-card border border-border/40 rounded-xl px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">{payload[0].payload.count} transaksi</p>
      <p className="text-primary font-medium">{fmtRp(payload[0].payload.revenue)}</p>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtRp = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)

const fmtDate = (s: string) => new Date(s).toLocaleString('id-ID')

function exportCsv(rows: any[]) {
  const headers = ['Transaction #', 'Date', 'Type', 'Payment', 'Cashier', 'Total', 'Status']
  const lines = rows.map(r =>
    [r.transaction_number, r.transaction_date, r.order_type, r.payment_method, r.cashier, r.grand_total, r.status].join(',')
  )
  const csv = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'sales-report.csv'; a.click()
  URL.revokeObjectURL(url)
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SalesReportPage() {
  const [dateRange, setDateRange] = React.useState({
    from: subDays(new Date(), 30),
    to: new Date()
  })

  const { data: response, isLoading } = useQuery({
    queryKey: ['report-sales', dateRange],
    queryFn: () => reportService.getSalesReport({
      date_from: format(dateRange.from, 'yyyy-MM-dd'),
      date_to: format(dateRange.to, 'yyyy-MM-dd'),
    }),
  })

  // Unwrap API envelope: response.data contains the actual report
  const data = response?.data

  // Only render Recharts when the chart scrolls into view (32.3)
  const { ref: chartRef, isVisible: chartVisible } = useLazyVisible('200px')

  const s = data?.summary
  // Map hour number (9) → display string ("09:00")
  const hourly = (s?.hourly_distribution || []).map(h => ({
    hour: String(h.hour).padStart(2, '0') + ':00',
    count: h.transactions,
    revenue: h.revenue,
  }))
  const maxCount = Math.max(...hourly.map(h => h.count), 1)

  type TxRow = NonNullable<typeof data>['transactions'][0]

  const columns: ColumnDef<TxRow>[] = [
    {
      accessorKey: 'transaction_number',
      header: 'Receipt #',
      cell: ({ row }) => <span className="font-mono text-xs text-foreground">{row.getValue('transaction_number')}</span>,
    },
    {
      accessorKey: 'transaction_date',
      header: 'Date',
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{fmtDate(row.getValue('transaction_date'))}</span>,
    },
    {
      accessorKey: 'order_type',
      header: 'Type',
      cell: ({ row }) => {
        const t = row.getValue('order_type') as string
        return <Badge variant="outline" className="capitalize bg-muted/20 border-border">{t.replace('_', ' ')}</Badge>
      },
    },
    {
      accessorKey: 'payment_method',
      header: 'Payment',
      cell: ({ row }) => <span className="uppercase text-xs font-bold tracking-wider text-muted-foreground">{row.getValue('payment_method')}</span>,
    },
    {
      accessorKey: 'cashier',
      header: 'Cashier',
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue('cashier')}</span>,
    },
    {
      accessorKey: 'grand_total',
      header: 'Total',
      cell: ({ row }) => <span className="font-semibold text-right text-foreground">{fmtRp(row.getValue('grand_total'))}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: () => <Badge className="bg-success/15 text-success border-0">Completed</Badge>,
    },
  ]

  return (
    <div className="p-8 pb-16 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary/70 uppercase tracking-widest mb-1">Reports</p>
          <h1 className="text-4xl font-serif font-light text-foreground tracking-tight">Sales Report</h1>
          <p className="text-muted-foreground font-light mt-1 text-lg">Revenue, transactions, and payment breakdown.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3">
          <DashboardDateRange 
            from={dateRange.from} 
            to={dateRange.to} 
            onChange={setDateRange} 
          />
          {data && (
            <button
              onClick={() => exportCsv(data.transactions)}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/15 px-4 py-2 rounded-full h-10"
            >
              ↓ Export CSV
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-[1.5rem]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Total Revenue" value={fmtRp(s?.total_revenue || 0)} sub={`${s?.total_transactions} transactions`} icon={TrendingUp} accent="bg-primary" />
          <KpiCard label="Avg. Transaction" value={fmtRp(data ? s!.total_revenue / (s!.total_transactions || 1) : 0)} icon={CreditCard} accent="bg-secondary" />
          <KpiCard label="Dine In" value={`${s?.dine_in_count}`} sub={`Takeaway: ${s?.takeaway_count}`} icon={ShoppingCart} accent="bg-success" />
          <KpiCard label="QRIS" value={fmtRp(0)} sub={`(Payment breakdown via shifts)`} icon={BarChart2} accent="bg-amber-500" />
        </div>
      )}

      {/* Hourly Bar Chart */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/40 p-6 rounded-[2rem] shadow-sm">
        <h2 className="font-serif text-xl font-light text-foreground mb-1">Hourly Transaction Volume</h2>
        <p className="text-sm text-muted-foreground mb-6">Peak hours highlighted in primary color</p>
        {/* Intersection observer wrapper — chart only mounts once visible */}
        <div ref={chartRef}>
          {isLoading ? (
            <div className="h-64 bg-muted/20 animate-pulse rounded-2xl" />
          ) : !chartVisible ? (
            <div className="h-64 bg-muted/10 rounded-2xl flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Chart loading…</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={hourly} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {hourly.map((entry) => (
                    <Cell
                      key={entry.hour}
                      fill={entry.count >= maxCount * 0.75
                        ? 'hsl(var(--primary))'
                        : entry.count >= maxCount * 0.5
                        ? 'hsl(var(--primary) / 0.6)'
                        : 'hsl(var(--muted-foreground) / 0.25)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/40 p-6 rounded-[2rem] shadow-sm">
        <h2 className="font-serif text-xl font-light text-foreground mb-6">Transaction Detail</h2>
        <DataTable
          columns={columns}
          data={data?.transactions || []}
          isLoading={isLoading}
          searchKey="transaction_number"
          searchPlaceholder="Search receipt #..."
          emptyMessage="No transactions found."
        />
      </div>
    </div>
  )
}
