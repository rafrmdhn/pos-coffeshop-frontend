import { api } from '@/lib/apiClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Shift {
  id: string
  outlet_id: string
  opened_by: { id: string; name: string }
  closed_by: { id: string; name: string } | null
  opening_cash: number
  expected_cash: number
  actual_cash: number | null
  cash_difference: number | null
  total_transactions: number
  total_revenue: number
  total_cash_sales: number
  total_qris_sales: number
  status: 'open' | 'closed'
  opened_at: string
  closed_at: string | null
  notes: string | null
  shift_counts?: { id: string; denomination: number; qty: number; subtotal: number }[]
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  outlet_id: string
  user: { id: string; name: string }
  category: string
  description: string
  amount: number
  expense_date: string
  reference_number: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Voucher {
  id: string
  outlet_id: string | null
  code: string
  name: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_purchase: number
  max_discount: number | null
  usage_limit: number | null
  usage_count: number
  valid_from: string
  valid_until: string
  is_active: boolean
  is_valid: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  outlet_id: string
  shift_id: string
  user_id: string
  voucher_id: string | null
  transaction_number: string
  order_type: 'dine_in' | 'takeaway'
  subtotal: number
  discount_amount: number
  tax_rate: number
  tax_amount: number
  grand_total: number
  status: 'completed' | 'voided'
  source: 'online' | 'offline'
  notes: string | null
  void_reason: string | null
  voided_at: string | null
  transaction_date: string
  items: {
    id: string; product_id: string; product_name: string
    product_price: number; quantity: number; notes: string | null; subtotal: number
  }[]
  payments: {
    id: string; payment_method: 'cash' | 'qris'; amount: number
    cash_received: number | null; cash_change: number | null; reference_number: string | null
  }[]
  user: { id: string; name: string }
  voucher: { id: string; code: string; name: string } | null
  created_at: string
  updated_at: string
}

// ── Shift Service ─────────────────────────────────────────────────────────────
export const shiftService = {
  getShifts(params?: { status?: 'open' | 'closed'; page?: number; per_page?: number }):
    Promise<PaginatedResponse<Shift>> {
    return api.get('/api/shifts', { params: { per_page: 15, ...params } })
  },

  getActiveShift(): Promise<ApiResponse<Shift | null>> {
    return api.get<PaginatedResponse<Shift>>('/api/shifts', { 
      params: { status: 'open', per_page: 1 } 
    }).then(res => ({
      success: true,
      message: '',
      ...res,
      data: res.data[0] || null
    }))
  },

  openShift(data: { opening_cash: number; notes?: string | null }): Promise<ApiResponse<Shift>> {
    return api.post('/api/shifts/open', data)
  },

  closeShift(data: {
    counts: { denomination: number; qty: number }[]
    notes?: string | null
  }): Promise<ApiResponse<Shift>> {
    return api.post('/api/shifts/close', data)
  },
}

// ── Expense Service ───────────────────────────────────────────────────────────
export const expenseService = {
  getExpenses(params?: {
    date_from?: string; date_to?: string; category?: string
    page?: number; per_page?: number
  }): Promise<PaginatedResponse<Expense>> {
    return api.get('/api/expenses', { params: { per_page: 15, ...params } })
  },

  createExpense(data: {
    category: string; description: string; amount: number
    expense_date: string; reference_number?: string | null; notes?: string | null
  }): Promise<ApiResponse<Expense>> {
    return api.post('/api/expenses', data)
  },

  updateExpense(id: string, data: Partial<{
    category: string; description: string; amount: number
    expense_date: string; reference_number: string | null; notes: string | null
  }>): Promise<ApiResponse<Expense>> {
    return api.put(`/api/expenses/${id}`, data)
  },

  deleteExpense(id: string): Promise<ApiResponse<null>> {
    return api.delete(`/api/expenses/${id}`)
  },
}

// ── Voucher Service ───────────────────────────────────────────────────────────
export const voucherService = {
  getVouchers(params?: {
    search?: string; is_active?: boolean; page?: number; per_page?: number
  }): Promise<PaginatedResponse<Voucher>> {
    return api.get('/api/vouchers', { params: { per_page: 50, ...params } })
  },

  createVoucher(data: {
    code: string; name: string; discount_type: 'percentage' | 'fixed'
    discount_value: number; min_purchase?: number; max_discount?: number | null
    usage_limit?: number | null; valid_from: string; valid_until: string
    outlet_id?: string | null; is_active?: boolean
  }): Promise<ApiResponse<Voucher>> {
    return api.post('/api/vouchers', data)
  },

  updateVoucher(id: string, data: Partial<{
    code: string; name: string; discount_type: 'percentage' | 'fixed'
    discount_value: number; min_purchase: number; max_discount: number | null
    usage_limit: number | null; valid_from: string; valid_until: string
    outlet_id: string | null; is_active: boolean
  }>): Promise<ApiResponse<Voucher>> {
    return api.put(`/api/vouchers/${id}`, data)
  },

  deleteVoucher(id: string): Promise<ApiResponse<null>> {
    return api.delete(`/api/vouchers/${id}`)
  },

  validateVoucher(code: string, subtotal: number): Promise<{
    success: boolean
    data: { voucher: Voucher; discount_amount: number; message: string }
  }> {
    return api.post('/api/vouchers/validate', { code, subtotal })
  },
}

// ── Transaction Service ───────────────────────────────────────────────────────
export const transactionService = {
  getTransactions(params?: {
    date_from?: string; date_to?: string; status?: 'completed' | 'voided'
    search?: string; page?: number; per_page?: number
  }): Promise<PaginatedResponse<Transaction>> {
    return api.get('/api/transactions', { params: { per_page: 20, ...params } })
  },

  getTransaction(id: string): Promise<ApiResponse<Transaction>> {
    return api.get(`/api/transactions/${id}`)
  },

  createTransaction(data: {
    id?: string
    order_type: 'dine_in' | 'takeaway'
    items: { product_id: string; quantity: number; notes?: string | null }[]
    payments: {
      payment_method: 'cash' | 'qris'; amount: number
      cash_received?: number | null; reference_number?: string | null
    }[]
    voucher_code?: string | null
    notes?: string | null
    transaction_date?: string
    source?: 'online' | 'offline'
  }): Promise<ApiResponse<Transaction>> {
    return api.post('/api/transactions', data)
  },

  voidTransaction(id: string, reason: string): Promise<ApiResponse<Transaction>> {
    return api.post(`/api/transactions/${id}/void`, { reason })
  },

  syncOfflineTransactions(transactions: any[]): Promise<any> {
    return api.post('/api/transactions/sync', { transactions })
  },
}

// ── Legacy namespace alias (for backward compat with pages using operationalService.x) ──
export const operationalService = {
  getShifts: () => shiftService.getShifts(),
  getActiveShift: () => shiftService.getActiveShift(),
  openShift: (opening_cash: number, notes?: string) => shiftService.openShift({ opening_cash, notes }),
  closeShift: (_id: string, actual_cash: number) =>
    shiftService.closeShift({ counts: [{ denomination: 100, qty: Math.floor(actual_cash / 100) }] }),
  getExpenses: () => expenseService.getExpenses(),
  createExpense: (data: any) => expenseService.createExpense(data),
  updateExpense: (id: string, data: any) => expenseService.updateExpense(id, data),
  deleteExpense: (id: string) => expenseService.deleteExpense(id),
  getVouchers: () => voucherService.getVouchers(),
  createVoucher: (data: any) => voucherService.createVoucher(data),
  updateVoucher: (id: string, data: any) => voucherService.updateVoucher(id, data),
  deleteVoucher: (id: string) => voucherService.deleteVoucher(id),
  getTransactions: () => transactionService.getTransactions(),
  voidTransaction: (id: string, reason: string) => transactionService.voidTransaction(id, reason),
}
