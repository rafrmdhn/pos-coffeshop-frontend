import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Coffee, LayoutDashboard, Settings, ShoppingBag, Tags, Boxes, Clock, ReceiptText, Ticket, Banknote, Building2, Users, ShieldCheck, ScrollText, LineChart, PackageSearch, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

export default function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const location = useLocation();

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col min-h-screen shadow-2xl md:shadow-sm transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border font-bold text-lg text-primary">
          Kopi Nusantara
          <button className="md:hidden text-foreground hover:bg-muted p-1 rounded-md" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <Link to="/pos" className="flex flex-row items-center gap-3 p-3 text-sm font-medium rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-foreground transition-colors">
          <Coffee size={20} className="text-primary/70" />
          POS Terminal
        </Link>

        {(useAuthStore.getState().hasRole('owner') || useAuthStore.getState().hasRole('manager')) && (
          <>
            <div className="pt-4 pb-2 px-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Management</p>
            </div>
            <Link to="/dashboard" className="flex flex-row items-center gap-3 p-3 text-sm font-medium rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-foreground transition-colors">
              <LayoutDashboard size={20} className="text-muted-foreground/70" />
              Overview
            </Link>
            <Link to="/products" className="flex flex-row items-center gap-3 p-3 text-sm font-medium rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-foreground transition-colors">
              <ShoppingBag size={20} className="text-muted-foreground/70" />
              Products
            </Link>
            <Link to="/categories" className="flex flex-row items-center gap-3 p-3 text-sm font-medium rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-foreground transition-colors">
              <Tags size={20} className="text-muted-foreground/70" />
              Categories
            </Link>
            <Link to="/inventory" className="flex flex-row items-center gap-3 p-3 text-sm font-medium rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-foreground transition-colors">
              <Boxes size={20} className="text-muted-foreground/70" />
              Inventory
            </Link>
            <Link to="/shifts" className="flex flex-row items-center gap-3 p-3 text-sm font-medium rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-foreground transition-colors">
              <Clock size={20} className="text-muted-foreground/70" />
              Shifts
            </Link>
            <Link to="/transactions" className="flex flex-row items-center gap-3 p-3 text-sm font-medium rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-foreground transition-colors">
              <ReceiptText size={20} className="text-muted-foreground/70" />
              Transactions
            </Link>
            <Link to="/expenses" className="flex flex-row items-center gap-3 p-3 text-sm font-medium rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-foreground transition-colors">
              <Banknote size={20} className="text-muted-foreground/70" />
              Expenses
            </Link>
            <Link to="/vouchers" className="flex flex-row items-center gap-3 p-3 text-sm font-medium rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-foreground transition-colors">
              <Ticket size={20} className="text-muted-foreground/70" />
              Vouchers
            </Link>

            <div className="pt-4 pb-2 px-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Reports</p>
            </div>
            <Link to="/reports/sales" className="flex flex-row items-center gap-3 p-3 text-sm font-medium rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-foreground transition-colors">
              <LineChart size={20} className="text-muted-foreground/70" />
              Sales Performance
            </Link>
            <Link to="/reports/inventory" className="flex flex-row items-center gap-3 p-3 text-sm font-medium rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-foreground transition-colors">
              <PackageSearch size={20} className="text-muted-foreground/70" />
              Inventory Analysis
            </Link>
          </>
        )}

        {useAuthStore.getState().hasRole('owner') && (
          <>
            <div className="pt-4 pb-2 px-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Core Admin</p>
            </div>
            <Link to="/outlets" className="flex flex-row items-center gap-3 p-3 text-sm font-medium rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-foreground transition-colors">
              <Building2 size={20} className="text-muted-foreground/70" />
              Outlets
            </Link>
            <Link to="/users" className="flex flex-row items-center gap-3 p-3 text-sm font-medium rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-foreground transition-colors">
              <Users size={20} className="text-muted-foreground/70" />
              User Accounts
            </Link>
            <Link to="/roles" className="flex flex-row items-center gap-3 p-3 text-sm font-medium rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-foreground transition-colors">
              <ShieldCheck size={20} className="text-muted-foreground/70" />
              Roles & Perms
            </Link>
            <Link to="/audit-logs" className="flex flex-row items-center gap-3 p-3 text-sm font-medium rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-foreground transition-colors">
              <ScrollText size={20} className="text-muted-foreground/70" />
              Audit Trail
            </Link>
          </>
        )}

        {(useAuthStore.getState().hasRole('owner') || useAuthStore.getState().hasRole('manager')) && (
          <Link to="/settings" className="flex flex-row items-center gap-3 p-3 text-sm font-medium rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-foreground transition-colors">
            <Settings size={20} className="text-muted-foreground/70" />
            Settings
          </Link>
        )}
      </nav>
      {user && (
        <div className="p-4 border-t border-sidebar-border text-sm flex gap-3 items-center">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.roles[0]}</p>
          </div>
        </div>
      )}
    </aside>
    </>
  );
}
