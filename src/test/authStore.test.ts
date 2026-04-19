import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import type { AuthUser } from '@/types/api'

// Mock localStorage for the persist middleware
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

const MOCK_USER: AuthUser = {
  id: 'user-1',
  name: 'Ahmad Fauzi',
  email: 'owner@kopinusantara.id',
  is_active: true,
  roles: ['owner', 'manager'],
  permissions: ['view-products', 'manage-products', 'view-reports', 'manage-users'],
  outlet: { id: 'outlet-1', name: 'Kopi Nusantara Pusat', slug: 'kopi-nusantara-pusat' },
}

const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-token'

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    token: null,
    permissions: [],
    outlet: null,
  })
  localStorageMock.clear()
})

describe('Auth Store', () => {
  // ── setAuth ────────────────────────────────────────────────────────────────
  describe('setAuth', () => {
    it('stores user and token after login', () => {
      useAuthStore.getState().setAuth(MOCK_USER, MOCK_TOKEN)
      const { user, token } = useAuthStore.getState()
      expect(user?.id).toBe('user-1')
      expect(token).toBe(MOCK_TOKEN)
    })

    it('stores user permissions', () => {
      useAuthStore.getState().setAuth(MOCK_USER, MOCK_TOKEN)
      expect(useAuthStore.getState().permissions).toContain('view-products')
      expect(useAuthStore.getState().permissions).toContain('manage-users')
    })

    it('stores the user outlet', () => {
      useAuthStore.getState().setAuth(MOCK_USER, MOCK_TOKEN)
      expect(useAuthStore.getState().outlet?.id).toBe('outlet-1')
    })
  })

  // ── logout ─────────────────────────────────────────────────────────────────
  describe('logout', () => {
    it('clears all auth state on logout', () => {
      useAuthStore.getState().setAuth(MOCK_USER, MOCK_TOKEN)
      useAuthStore.getState().logout()
      const { user, token, permissions, outlet } = useAuthStore.getState()
      expect(user).toBeNull()
      expect(token).toBeNull()
      expect(permissions).toHaveLength(0)
      expect(outlet).toBeNull()
    })
  })

  // ── hasPermission ──────────────────────────────────────────────────────────
  describe('hasPermission', () => {
    it('returns true for a permission the user has', () => {
      useAuthStore.getState().setAuth(MOCK_USER, MOCK_TOKEN)
      expect(useAuthStore.getState().hasPermission('view-products')).toBe(true)
    })

    it('returns false for a permission the user does NOT have', () => {
      useAuthStore.getState().setAuth(MOCK_USER, MOCK_TOKEN)
      expect(useAuthStore.getState().hasPermission('void-transactions')).toBe(false)
    })

    it('returns false when user is not logged in', () => {
      expect(useAuthStore.getState().hasPermission('view-products')).toBe(false)
    })
  })

  // ── hasRole ────────────────────────────────────────────────────────────────
  describe('hasRole', () => {
    it('returns true for a role the user has', () => {
      useAuthStore.getState().setAuth(MOCK_USER, MOCK_TOKEN)
      expect(useAuthStore.getState().hasRole('owner')).toBe(true)
      expect(useAuthStore.getState().hasRole('manager')).toBe(true)
    })

    it('returns false for a role the user does NOT have', () => {
      useAuthStore.getState().setAuth(MOCK_USER, MOCK_TOKEN)
      expect(useAuthStore.getState().hasRole('cashier')).toBe(false)
    })

    it('returns false when user is not logged in', () => {
      expect(useAuthStore.getState().hasRole('owner')).toBe(false)
    })
  })
})
