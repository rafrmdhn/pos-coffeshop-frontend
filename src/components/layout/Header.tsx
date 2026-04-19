import { LogOut, Sun, Moon, Menu, Bell, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { reportService } from '@/services/reportService';
import { outletService } from '@/services/adminService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { setActiveOutletContext } from '@/services/auth';

export default function Header() {
  const queryClient = useQueryClient();
  const { theme, setTheme } = useUiStore();
  const { logout, user, hasRole, selectedOutletId, setOutletId } = useAuthStore();

  const { data: outletsData } = useQuery({
    queryKey: ['header-outlets'],
    queryFn: () => outletService.getOutlets(),
    enabled: hasRole('owner'),
  });

  const { data: invReport } = useQuery({
    queryKey: ['report-inventory'],
    queryFn: () => reportService.getInventoryReport(),
    staleTime: 5 * 60 * 1000,
  });

  const lowStockCount = invReport?.data?.summary.low_stock_count ?? 0;
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const handleOutletChange = async (id: string) => {
    try {
      // Set server-side outlet context if owner
      if (hasRole('owner')) {
        await setActiveOutletContext(id);
      }
      
      setOutletId(id);
      // Invalidate everything to refresh reports and list data under new scope
      queryClient.invalidateQueries();
    } catch (error) {
      console.error('Failed to set outlet context:', error);
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b bg-card">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-foreground">
          <Menu size={24} />
        </button>
        
        <div className="hidden md:flex flex-col ml-2 min-w-[200px]">
          <span className="font-semibold text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1 flex items-center gap-1.5">
            <Building2 size={10} /> Cabang Aktif
          </span>
          
          {hasRole('owner') ? (
            <Select value={selectedOutletId || ''} onValueChange={handleOutletChange}>
              <SelectTrigger className="h-7 border-none bg-transparent p-0 text-sm font-bold shadow-none focus:ring-0">
                <SelectValue placeholder="Pilih Outlet" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {outletsData?.data.map(o => (
                  <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-sm font-bold text-foreground truncate">
              {user?.outlet?.name || '—'}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full hover:bg-muted text-foreground transition-all active:scale-95"
          title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        <Link to="/inventory" className="relative p-2 rounded-full hover:bg-muted text-foreground transition-all active:scale-95">
          <Bell size={20} />
          {lowStockCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white shadow-sm ring-2 ring-card">
              {lowStockCount}
            </span>
          )}
        </Link>
        
        <div className="h-6 w-px bg-border mx-1" />

        <button 
          onClick={logout} 
          className="flex gap-2 items-center text-sm px-4 py-2 rounded-full hover:bg-destructive/10 text-destructive font-semibold transition-all hover:pr-5 group"
        >
          <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
          Keluar
        </button>
      </div>
    </header>
  );
}
