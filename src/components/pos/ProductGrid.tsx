import { useCartStore } from '@/stores/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Coffee } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/productAndCategoryService';

export function ProductGrid() {
  const { activeCategory, addItem } = useCartStore();

  const { data: response, isLoading } = useQuery({
    queryKey: ['products', activeCategory],
    queryFn: () => productService.getProducts({
      category_id: activeCategory === 'all' ? undefined : activeCategory,
      is_active: true,
      per_page: 100
    }),
  });

  const products = response?.data || [];
  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-muted/20 animate-pulse rounded-[1.25rem]" />
        ))}
      </div>
    );
  }

  return (
    <motion.div layout className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5">
      <AnimatePresence>
        {products.map((product) => {
          // Fallback color if no image
          const gradientColors = [
            'from-[#4a3628] to-[#8c6239]',
            'from-[#2a4d33] to-[#5b8c66]',
            'from-[#1c1411] to-[#3b2a22]',
            'from-[#8c5220] to-[#d99f4c]'
          ];
          const color = gradientColors[Math.abs(product.id.split('').reduce((a,b) => a + b.charCodeAt(0), 0)) % gradientColors.length];

          return (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              key={product.id}
              onClick={() => addItem(product)}
              className="group relative rounded-[1.25rem] overflow-hidden bg-card/40 border border-border/30 flex flex-col cursor-pointer transition-all duration-300 select-none touch-manipulation hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 active:scale-95"
            >
              {/* Product Visual */}
              <div className="w-full aspect-[4/3] relative overflow-hidden flex items-center justify-center">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${color} flex items-center justify-center p-4`}>
                    <Coffee className="text-white/20 w-12 h-12" />
                    <div className="absolute w-[200%] h-[200%] rounded-full border border-white/5 opacity-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none mix-blend-overlay" />
                  </div>
                )}
                
                <div className="absolute bottom-3 left-3 bg-black/20 backdrop-blur-md text-white/90 text-[10px] uppercase font-bold tracking-[0.2em] px-2.5 py-1 rounded-md">
                   {product.category?.name || 'Menu'}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3 md:p-4 flex flex-col flex-1 bg-card/60 backdrop-blur-md">
                <h3 className="font-serif font-medium text-foreground text-sm md:text-base leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="font-sans font-bold text-base md:text-lg text-primary tracking-tight">
                    {formatIDR(product.price)}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Plus size={16} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
