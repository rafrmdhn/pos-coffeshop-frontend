"use client"
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartConfig = {
  amount: {
    label: "Revenue (Rp)",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

export function RevenueChart({ data }: { data: any[] }) {
  return (
    <Card className="col-span-full lg:col-span-4 bg-card/60 backdrop-blur-md border-border/40 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="font-serif text-2xl tracking-tighter">Daily Revenue Target</CardTitle>
        <CardDescription className="opacity-80 text-sm tracking-wide">Gross income performance over the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4 pr-6">
        <ChartContainer config={chartConfig} className="w-full h-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.6} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tickMargin={14}
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12, fontWeight: 500 }}
              />
              <ChartTooltip 
                cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1, strokeDasharray: '4 4' }} 
                content={<ChartTooltipContent indicator="line" />} 
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="var(--color-primary)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#fillAmount)" 
                activeDot={{ r: 6, fill: 'var(--color-primary)', stroke: 'var(--color-background)', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
