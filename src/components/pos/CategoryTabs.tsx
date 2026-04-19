import { useCartStore } from '@/stores/cartStore';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/productAndCategoryService';
import { Coffee, LayoutGrid } from 'lucide-react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export function CategoryTabs() {
  const { activeCategory, setActiveCategory } = useCartStore();

  const { data: response, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });

  const categories = response?.data || [];

  return (
    <div className="w-full bg-background border-b border-border/50 pb-0 shrink-0">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-2.5 p-4 md:px-6">
          {/* Default 'All' Category */}
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ease-out 
              ${activeCategory === 'all' 
                ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
          >
            <LayoutGrid size={16} strokeWidth={activeCategory === 'all' ? 2.5 : 2} />
            Semua
          </button>

          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-10 w-24 bg-muted/20 animate-pulse rounded-full" />
            ))
          ) : (
            categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ease-out 
                  ${activeCategory === cat.id 
                    ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
              >
                {/* Fallback icon or mapping based on name if needed */}
                <Coffee size={16} strokeWidth={activeCategory === cat.id ? 2.5 : 2} />
                {cat.name}
              </button>
            ))
          )}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  )
}
