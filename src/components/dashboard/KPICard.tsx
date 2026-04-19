import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react"

interface KPICardProps {
  title: string;
  value: string;
  trend: number;
  icon: LucideIcon;
}

export function KPICard({ title, value, trend, icon: Icon }: KPICardProps) {
  const isPositive = trend >= 0;

  return (
    <Card className="relative overflow-hidden p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50 group bg-card/60 backdrop-blur-md border-border/40">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-primary/10 transition-transform duration-500 ease-out group-hover:scale-150 blur-xl pointer-events-none" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="p-3 rounded-2xl bg-primary/15 text-primary shadow-sm border border-primary/10">
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${isPositive ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>
          {isPositive ? <TrendingUp size={14} strokeWidth={2.5} /> : <TrendingDown size={14} strokeWidth={2.5} />}
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>
      
      <div className="relative z-10">
        <p className="text-sm font-semibold text-muted-foreground mb-1 tracking-wide uppercase opacity-80">{title}</p>
        <h3 className="font-sans text-3xl md:text-4xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">{value}</h3>
      </div>
    </Card>
  )
}
