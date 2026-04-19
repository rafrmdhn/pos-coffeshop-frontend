export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: PaginationMeta;
  links?: PaginationLinks;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  outlet: OutletSimple;
  roles: string[];
  permissions: string[];
}

export interface OutletSimple {
  id: string;
  name: string;
  slug: string;
}

export interface Outlet extends OutletSimple {
  address?: string | null;
  phone?: string | null;
  tax_id?: string | null;
  timezone: string;
  receipt_header?: string | null;
  receipt_footer?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  outlet_id?: string | null;
  outlet?: OutletSimple;
  name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  roles: string[];
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  outlet_id: string;
  name: string;
  slug: string;
  description?: string | null;
  sort_order: number;
  is_active: boolean;
  products_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  outlet_id: string;
  category_id: string;
  category?: Category;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  price: number;
  sku?: string | null;
  is_active: boolean;
  track_stock: boolean;
  stock?: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RawMaterial {
  id: string;
  outlet_id: string;
  name: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  cost_per_unit: number;
  is_low_stock: boolean;
  last_restock_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecipeItem {
  id: string;
  raw_material_id: string;
  raw_material: {
    id: string;
    name: string;
    unit: string;
    cost_per_unit: number;
  };
  quantity_needed: number;
  estimated_cost: number;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string | null;
}

export interface Transaction {
  id: string;
  outlet_id: string;
  shift_id: string;
  user_id: string;
  receipt_number: string;
  order_type: "dine_in" | "takeaway";
  status: "completed" | "voided";
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  grand_total: number;
  payment_method: "cash" | "qris";
  amount_tendered: number;
  change_amount: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  items?: TransactionItem[];
}

export interface Shift {
  id: string;
  outlet_id: string;
  opened_by: string;
  closed_by?: string | null;
  opened_at: string;
  closed_at?: string | null;
  status: "open" | "closed";
  starting_cash: number;
  actual_cash?: number | null;
  expected_cash?: number | null;
  cash_difference?: number | null;
}

export interface Expense {
  id: string;
  outlet_id: string;
  user_id: string;
  category: "salary" | "rent" | "utilities" | "supplies" | "maintenance" | "marketing" | "other";
  description: string;
  amount: number;
  date: string;
  reference_number?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Voucher {
  id: string;
  code: string;
  name: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_purchase?: number | null;
  max_discount?: number | null;
  usage_limit?: number | null;
  used_count: number;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
