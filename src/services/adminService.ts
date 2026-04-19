import { api } from '@/lib/apiClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Outlet {
  id: string
  name: string
  slug: string
  address: string | null
  phone: string | null
  tax_id: string | null
  timezone: string
  receipt_header: string | null
  receipt_footer: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  outlet_id: string | null
  outlet: { id: string; name: string; slug: string } | null
  name: string
  email: string
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  roles: string[]
  created_at: string
  updated_at: string
}

export interface Role {
  id: number
  name: string
  guard_name: string
  permissions: string[]
  users_count: number
  created_at: string
  updated_at: string
}

export interface Permission {
  id: number
  name: string
  guard_name: string
  description: string | null
}

export interface AuditLog {
  id: string
  user: { id: string; name: string; email: string } | null
  outlet: { id: string; name: string } | null
  action: 'created' | 'updated' | 'deleted' | 'voided' | 'login' | 'logout'
  auditable_type: string
  auditable_id: string
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

// ── Outlet Service ────────────────────────────────────────────────────────────
export const outletService = {
  getOutlets(params?: { search?: string; page?: number; per_page?: number }):
    Promise<PaginatedResponse<Outlet>> {
    return api.get('/api/outlets', { params: { per_page: 50, ...params } })
  },

  createOutlet(data: {
    name: string; address?: string | null; phone?: string | null
    tax_id?: string | null; timezone?: string
    receipt_header?: string | null; receipt_footer?: string | null; is_active?: boolean
  }): Promise<ApiResponse<Outlet>> {
    return api.post('/api/outlets', data)
  },

  updateOutlet(id: string, data: Partial<{
    name: string; address: string | null; phone: string | null
    tax_id: string | null; timezone: string
    receipt_header: string | null; receipt_footer: string | null; is_active: boolean
  }>): Promise<ApiResponse<Outlet>> {
    return api.put(`/api/outlets/${id}`, data)
  },
}

// ── User Service ──────────────────────────────────────────────────────────────
export const userService = {
  getUsers(params?: {
    search?: string; role?: string; outlet_id?: string
    page?: number; per_page?: number
  }): Promise<PaginatedResponse<User>> {
    return api.get('/api/users', { params: { per_page: 50, ...params } })
  },

  createUser(data: {
    name: string; email: string; password: string; password_confirmation: string
    role: 'owner' | 'manager' | 'cashier'; outlet_id?: string | null
    phone?: string | null; pin?: string; is_active?: boolean
  }): Promise<ApiResponse<User>> {
    return api.post('/api/users', data)
  },

  updateUser(id: string, data: Partial<{
    name: string; email: string; phone: string | null
    outlet_id: string | null; role: string; pin: string | null
    password: string; password_confirmation: string; is_active: boolean
  }>): Promise<ApiResponse<User>> {
    return api.put(`/api/users/${id}`, data)
  },

  deleteUser(id: string): Promise<ApiResponse<null>> {
    return api.delete(`/api/users/${id}`)
  },
}

// ── Role Service ──────────────────────────────────────────────────────────────
export const roleService = {
  getRoles(): Promise<PaginatedResponse<Role>> {
    return api.get('/api/roles', { params: { with_count: true, per_page: 50 } })
  },

  getPermissions(): Promise<{ data: Permission[] }> {
    return api.get('/api/permissions')
  },

  createRole(data: { name: string; permissions: string[] }): Promise<ApiResponse<Role>> {
    return api.post('/api/roles', data)
  },

  updateRole(id: number, data: { name?: string; permissions?: string[] }): Promise<ApiResponse<Role>> {
    return api.put(`/api/roles/${id}`, data)
  },

  deleteRole(id: number): Promise<ApiResponse<null>> {
    return api.delete(`/api/roles/${id}`)
  },
}

// ── Audit Log Service ─────────────────────────────────────────────────────────
export const auditLogService = {
  getAuditLogs(params?: {
    search?: string; action?: string; auditable_type?: string
    date_from?: string; date_to?: string; page?: number; per_page?: number
  }): Promise<PaginatedResponse<AuditLog>> {
    return api.get('/api/audit-logs', { params: { per_page: 20, ...params } })
  },
}
