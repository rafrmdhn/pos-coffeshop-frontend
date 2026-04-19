import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TopProductsRanking({ data }: { data: any[] }) {
  // Gracefully handle empty or invalid data
  if (!data || data.length === 0) return null;
  
  const maxQty = Math.max(...data.map(d => d.qty));

  return (
    <Card className="col-span-full md:col-span-1 lg:col-span-4 flex flex-col bg-card/60 backdrop-blur-md border-border/40 transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle className="font-serif text-xl border-b border-border/40 pb-4">Best Sellers</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-6 mt-4">
        {data.map((product, index) => {
          const width = `${(product.qty / maxQty) * 100}%`;
          return (
            <div key={index} className="space-y-2.5 group">
              <div className="flex justify-between text-sm items-end">
                <span className="font-sans font-medium text-foreground tracking-wide group-hover:text-primary transition-colors">{product.name}</span>
                <span className="text-muted-foreground font-sans font-bold text-base leading-none tracking-tight">{product.qty} <span className="font-normal text-xs uppercase tracking-widest ml-1">cups</span></span>
              </div>
              <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary/70 rounded-full transition-all duration-1000 ease-out group-hover:bg-primary"
                  style={{ width: width }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
