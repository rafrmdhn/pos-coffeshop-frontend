import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { AuthUser } from '@/types/api'

// ── PermissionGate component (inline for isolation) ───────────────────────
// If the project has a standalone PermissionGate, replace the inline version
// below with: import { PermissionGate } from '@/components/PermissionGate'
function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const hasPermission = useAuthStore(s => s.hasPermission)
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>
}

const BASE_USER: AuthUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@test.com',
  is_active: true,
  roles: ['manager'],
  permissions: ['view-products', 'manage-products'],
  outlet: { id: 'o1', name: 'Test Outlet', slug: 'test-outlet' },
}

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('PermissionGate', () => {
  it('renders children when user has the required permission', () => {
    useAuthStore.setState({ permissions: BASE_USER.permissions })
    renderWithRouter(
      <PermissionGate permission="view-products">
        <span>Secret Content</span>
      </PermissionGate>
    )
    expect(screen.getByText('Secret Content')).toBeInTheDocument()
  })

  it('hides children when user does NOT have the required permission', () => {
    useAuthStore.setState({ permissions: ['view-products'] })
    renderWithRouter(
      <PermissionGate permission="manage-users">
        <span>Admin Panel</span>
      </PermissionGate>
    )
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument()
  })

  it('renders fallback when user lacks permission', () => {
    useAuthStore.setState({ permissions: [] })
    renderWithRouter(
      <PermissionGate permission="view-reports" fallback={<span>Access Denied</span>}>
        <span>Report Data</span>
      </PermissionGate>
    )
    expect(screen.getByText('Access Denied')).toBeInTheDocument()
    expect(screen.queryByText('Report Data')).not.toBeInTheDocument()
  })

  it('renders nothing (no fallback) for missing permission, hides content', () => {
    useAuthStore.setState({ permissions: [] })
    renderWithRouter(
      <PermissionGate permission="delete-products">
        <button>Delete</button>
      </PermissionGate>
    )
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('renders children when user has multiple permissions including required one', () => {
    useAuthStore.setState({ permissions: ['view-products', 'manage-products', 'view-reports'] })
    renderWithRouter(
      <PermissionGate permission="view-reports">
        <span>Revenue Chart</span>
      </PermissionGate>
    )
    expect(screen.getByText('Revenue Chart')).toBeInTheDocument()
  })
})
