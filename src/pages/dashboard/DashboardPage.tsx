import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/services/reports';
import { useAuthStore } from '@/stores/authStore';
import { KPICard } from '@/components/dashboard/KPICard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { PaymentChart } from '@/components/dashboard/PaymentChart';
import { TopProductsRanking } from '@/components/dashboard/TopProductsRanking';
import { DashboardDateRange } from '@/components/dashboard/DateRangePicker';
import { Banknote, Coffee, FileBarChart, Wallet } from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function DashboardPage() {
  const { selectedOutletId } = useAuthStore();
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 7),
    to: new Date()
  });

  const { data: dashboardResponse, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats', selectedOutletId, format(dateRange.from, 'yyyy-MM-dd'), format(dateRange.to, 'yyyy-MM-dd')],
    queryFn: () => getDashboardStats({
      date_from: format(dateRange.from, 'yyyy-MM-dd'),
      date_to: format(dateRange.to, 'yyyy-MM-dd'),
    }),
  });

  const dashboardData = dashboardResponse?.data;

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', maximumFractionDigits: 0
    }).format(val ?? 0);

  if (isLoading || !dashboardData) {
    return (
      <div className="p-8 w-full flex flex-col gap-6 animate-pulse">
        <div className="h-12 w-64 bg-muted/40 rounded-lg"></div>
        {error && <p className="text-destructive text-sm">{(error as any)?.message ?? 'Gagal memuat data dashboard'}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted/30 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  const { summary, revenue_by_day, revenue_by_payment_method, top_products } = dashboardData;

  // Map API fields → component props
  const dailyRevenue = revenue_by_day.map(d => ({ date: d.date, amount: d.revenue }));
  const paymentMethods = [
    { name: 'Cash', value: revenue_by_payment_method.cash, fill: 'var(--color-chart-2)' },
    { name: 'QRIS', value: revenue_by_payment_method.qris, fill: 'var(--color-chart-1)' },
  ];
  const topProducts = top_products.map(p => ({ name: p.product_name, qty: p.total_qty }));

  return (
    <div className="p-6 md:p-8 w-full max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col gap-8 animate-in fade-in duration-700">
      
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tighter">Business Overview</h1>
          <p className="text-muted-foreground font-sans mt-1">Reviewing metrics for Kopi Nusantara.</p>
        </div>
        
        {/* Actions / Filters */}
        <DashboardDateRange 
          from={dateRange.from} 
          to={dateRange.to} 
          onChange={setDateRange} 
        />
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        
        {/* KPI Row — mapped from API DashboardReport.summary */}
        <KPICard 
          title="Gross Revenue" 
          value={formatIDR(summary.total_revenue)} 
          trend={0}
          icon={Banknote} 
        />
        <KPICard 
          title="Net Profit" 
          value={formatIDR(summary.net_profit)} 
          trend={0}
          icon={Wallet} 
        />
        <KPICard 
          title="COGS (HPP)" 
          value={formatIDR(summary.total_hpp)} 
          trend={0}
          icon={Coffee} 
        />
        <KPICard 
          title="OpEx" 
          value={formatIDR(summary.total_opex)} 
          trend={0}
          icon={FileBarChart} 
        />

        {/* Charts Row */}
        <RevenueChart data={dailyRevenue} />
        <PaymentChart data={paymentMethods} />

        {/* Extended Row */}
        <TopProductsRanking data={topProducts} />
        
        {/* Empty Bento Filler */}
        <div className="col-span-full md:col-span-1 lg:col-span-4 bg-primary/10 rounded-xl border border-primary/20 border-dashed flex items-center justify-center min-h-[120px] backdrop-blur-sm opacity-60">
          <p className="text-primary font-serif font-medium text-lg">+ Add Custom Widget</p>
        </div>

      </div>
    </div>
  );
}
