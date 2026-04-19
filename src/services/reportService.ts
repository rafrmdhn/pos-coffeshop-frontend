import { api } from '@/lib/apiClient'

// ── Types matching api-spec.yaml DashboardReport & SalesReport ───────────────
export interface DashboardReportData {
  period: { from: string; to: string }
  summary: {
    total_revenue: number
    total_hpp: number
    total_opex: number
    net_profit: number
    total_transactions: number
    average_transaction: number
    total_voided: number
  }
  revenue_by_day: { date: string; revenue: number; transactions: number }[]
  revenue_by_payment_method: { cash: number; qris: number }
  top_products: {
    product_id: string
    product_name: string
    total_qty: number
    total_revenue: number
  }[]
  expense_by_category: { category: string; total: number }[]
}

export interface SalesReportData {
  period: { from: string; to: string }
  summary: {
    total_revenue: number
    total_transactions: number
    dine_in_count: number
    takeaway_count: number
    voided_count: number
    hourly_distribution: { hour: number; transactions: number; revenue: number }[]
  }
  transactions: {
    id: string
    transaction_number: string
    transaction_date: string
    order_type: 'dine_in' | 'takeaway'
    grand_total: number
    status: 'completed' | 'voided'
    cashier: string
    payment_method: string
  }[]
}

export interface InventoryReportData {
  summary: {
    total_materials: number
    low_stock_count: number
    total_stock_value: number
  }
  materials: {
    id: string
    name: string
    unit: string
    current_stock: number
    min_stock: number
    cost_per_unit: number
    total_value: number
    is_low_stock: boolean
    total_consumed: number
  }[]
}

// ── Dashboard Report (GET /api/reports/dashboard) ────────────────────────────
export const getDashboardStats = (params?: {
  date_from?: string
  date_to?: string
  outlet_id?: string
}): Promise<{ success: boolean; data: DashboardReportData }> =>
  api.get('/api/reports/dashboard', { params })

// ── Sales Report (GET /api/reports/sales) ────────────────────────────────────
export const reportService = {
  getSalesReport(params?: {
    date_from?: string
    date_to?: string
    outlet_id?: string
  }): Promise<{ success: boolean; data: SalesReportData }> {
    return api.get('/api/reports/sales', { params })
  },

  getInventoryReport(params?: {
    date_from?: string
    date_to?: string
    outlet_id?: string
  }): Promise<{ success: boolean; data: InventoryReportData }> {
    return api.get('/api/reports/inventory', { params })
  },
}
