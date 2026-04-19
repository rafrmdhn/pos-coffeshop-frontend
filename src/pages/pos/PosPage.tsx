import { useAuthStore } from '@/stores/authStore';
import { useAutoLogout } from '@/hooks/useAutoLogout';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { OrderPanel } from '@/components/pos/OrderPanel';
import { CategoryTabs } from '@/components/pos/CategoryTabs';
import { ArrowLeft, Wifi, WifiOff, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export default function PosPage() {
  useAutoLogout();
  const { outlet, hasRole, logout } = useAuthStore();
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem kasir?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] max-h-[100dvh] w-full bg-muted/20 overflow-hidden">
      
      {/* Mini POS Header */}
      <header className="h-16 shrink-0 bg-background border-b border-border/50 px-4 md:px-6 flex items-center justify-between z-10 transition-colors">
        <div className="flex items-center gap-4">
          {hasRole('owner') && (
             <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-muted rounded-full transition-colors mr-2">
                <ArrowLeft size={20} />
             </button>
          )}
          <div>
            <h1 className="font-serif text-xl font-semibold tracking-tight leading-none mb-1">Terminal Kasir</h1>
            <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground leading-none">{outlet?.name || 'Kopi Nusantara Pusat'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Offline indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mr-2 ${isOnline ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span className="hidden md:inline">{isOnline ? 'Online' : 'Offline Mode'}</span>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border/50 transition-all active:scale-95"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Split Screen Container */}
      <main className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Side: Product Browsing (65%) */}
        <section className="flex-1 flex flex-col w-full lg:w-[65%] shrink-0 border-r border-border/50 bg-background overflow-hidden">
          <CategoryTabs />
          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 lg:pb-6 custom-scrollbar bg-background/50">
            <ProductGrid />
          </div>
        </section>

        {/* Right Side: Order Cart Panel (35%) */}
        <section className="w-full lg:w-[35%] lg:min-w-[400px] lg:max-w-[480px] flex flex-col overflow-hidden shadow-2xl lg:shadow-none absolute lg:relative bottom-0 h-full z-40 transform transition-transform lg:translate-y-0">
          <OrderPanel />
        </section>

      </main>
    </div>
  );
}
