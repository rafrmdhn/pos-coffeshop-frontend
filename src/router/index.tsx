import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleProtectedRoute } from './RoleProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/auth/LoginPage'
import PinLoginPage from '@/pages/auth/PinLoginPage'

// ── Lazy-loaded pages (route-based code splitting) ────────────────────────
// Each page becomes its own JS chunk — loaded only when navigated to
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const PosPage = lazy(() => import('@/pages/pos/PosPage'))
const ProductManagementPage = lazy(() => import('@/pages/ProductManagementPage'))
const CategoryManagementPage = lazy(() => import('@/pages/CategoryManagementPage'))
const InventoryPage = lazy(() => import('@/pages/InventoryPage'))
const RecipePage = lazy(() => import('@/pages/RecipePage'))

const ShiftPage = lazy(() => import('@/pages/operational/ShiftPage'))
const ExpensePage = lazy(() => import('@/pages/operational/ExpensePage'))
const VoucherPage = lazy(() => import('@/pages/operational/VoucherPage'))
const TransactionHistoryPage = lazy(() => import('@/pages/operational/TransactionHistoryPage'))

const OutletPage = lazy(() => import('@/pages/admin/OutletPage'))
const UserManagementPage = lazy(() => import('@/pages/admin/UserManagementPage'))
const RoleManagementPage = lazy(() => import('@/pages/admin/RoleManagementPage'))
const AuditLogPage = lazy(() => import('@/pages/admin/AuditLogPage'))

const SalesReportPage = lazy(() => import('@/pages/reports/SalesReportPage'))
const InventoryReportPage = lazy(() => import('@/pages/reports/InventoryReportPage'))

// ── Skeleton fallback shown while lazy chunks load ────────────────────────
function PageSkeleton() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      <div className="h-10 w-64 bg-muted/40 rounded-xl" />
      <div className="h-5 w-96 bg-muted/30 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-32 bg-muted/25 rounded-[1.5rem]" />
        ))}
      </div>
      <div className="h-64 bg-muted/20 rounded-[2rem]" />
    </div>
  )
}

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
}

function RoleGate({ children, roles }: { children: React.ReactNode, roles: string[] }) {
  return <RoleProtectedRoute allowedRoles={roles}>{children}</RoleProtectedRoute>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/pin',
    element: <PinLoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      // ── POS mode: fullscreen, no sidebar/header ──────────────────────────
      { path: 'pos', element: <Lazy><PosPage /></Lazy> },
      // ── Main app with sidebar layout ─────────────────────────────────────
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <RoleGate roles={['owner', 'manager']}><Lazy><DashboardPage /></Lazy></RoleGate> },
          { path: 'dashboard', element: <RoleGate roles={['owner', 'manager']}><Lazy><DashboardPage /></Lazy></RoleGate> },
          { path: 'products', element: <RoleGate roles={['owner', 'manager']}><Lazy><ProductManagementPage /></Lazy></RoleGate> },
          { path: 'products/:id/recipe', element: <RoleGate roles={['owner', 'manager']}><Lazy><RecipePage /></Lazy></RoleGate> },
          { path: 'shifts', element: <RoleGate roles={['owner', 'manager', 'cashier']}><Lazy><ShiftPage /></Lazy></RoleGate> },
          { path: 'expenses', element: <RoleGate roles={['owner', 'manager']}><Lazy><ExpensePage /></Lazy></RoleGate> },
          { path: 'vouchers', element: <RoleGate roles={['owner', 'manager']}><Lazy><VoucherPage /></Lazy></RoleGate> },
          { path: 'transactions', element: <RoleGate roles={['owner', 'manager', 'cashier']}><Lazy><TransactionHistoryPage /></Lazy></RoleGate> },
          { path: 'categories', element: <RoleGate roles={['owner', 'manager']}><Lazy><CategoryManagementPage /></Lazy></RoleGate> },
          { path: 'inventory', element: <RoleGate roles={['owner', 'manager']}><Lazy><InventoryPage /></Lazy></RoleGate> },
          { path: 'outlets', element: <RoleGate roles={['owner']}><Lazy><OutletPage /></Lazy></RoleGate> },
          { path: 'users', element: <RoleGate roles={['owner']}><Lazy><UserManagementPage /></Lazy></RoleGate> },
          { path: 'roles', element: <RoleGate roles={['owner']}><Lazy><RoleManagementPage /></Lazy></RoleGate> },
          { path: 'audit-logs', element: <RoleGate roles={['owner']}><Lazy><AuditLogPage /></Lazy></RoleGate> },
          { path: 'reports/sales', element: <RoleGate roles={['owner', 'manager']}><Lazy><SalesReportPage /></Lazy></RoleGate> },
          { path: 'reports/inventory', element: <RoleGate roles={['owner', 'manager']}><Lazy><InventoryReportPage /></Lazy></RoleGate> },
        ]
      }
    ]
  }
])
