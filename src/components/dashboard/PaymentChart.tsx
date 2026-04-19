"use client"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const chartConfig = {
  value: {
    label: "Usage %",
  },
} satisfies ChartConfig

export function PaymentChart({ data }: { data: any[] }) {
  return (
    <Card className="col-span-full md:col-span-1 lg:col-span-4 bg-card/60 backdrop-blur-md border-border/40 flex flex-col justify-between transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle className="font-serif text-xl border-b border-border/40 pb-4">Payment Methods</CardTitle>
      </CardHeader>
      <CardContent className="pb-8 pt-6 flex-1 flex items-center justify-center">
        <ChartContainer config={chartConfig} className="w-full h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                stroke="var(--color-background)"
                strokeWidth={4}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
