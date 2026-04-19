import { api } from '@/lib/apiClient'
import type { Category, Product, PaginatedResponse, ApiResponse } from '@/types/api'

// ── Categories ────────────────────────────────────────────────────────────────
export const categoryService = {
  getCategories(params?: {
    search?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }): Promise<PaginatedResponse<Category>> {
    return api.get('/api/categories', { params: { per_page: 100, ...params } })
  },

  createCategory(data: {
    name: string
    description?: string | null
    sort_order?: number
    is_active?: boolean
  }): Promise<ApiResponse<Category>> {
    return api.post('/api/categories', data)
  },

  updateCategory(
    id: string,
    data: {
      name?: string
      description?: string | null
      sort_order?: number
      is_active?: boolean
    }
  ): Promise<ApiResponse<Category>> {
    return api.put(`/api/categories/${id}`, data)
  },

  deleteCategory(id: string): Promise<ApiResponse<null>> {
    return api.delete(`/api/categories/${id}`)
  },
}

// ── Products ──────────────────────────────────────────────────────────────────
export const productService = {
  getProducts(params?: {
    search?: string
    category_id?: string
    is_active?: boolean
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }): Promise<PaginatedResponse<Product>> {
    return api.get('/api/products', { params: { per_page: 100, ...params } })
  },

  getProduct(id: string): Promise<ApiResponse<Product>> {
    return api.get(`/api/products/${id}`)
  },

  createProduct(data: FormData): Promise<ApiResponse<Product>> {
    return api.postForm('/api/products', data)
  },

  updateProduct(id: string, data: FormData): Promise<ApiResponse<Product>> {
    // Laravel multipart PUT via POST + _method override
    data.append('_method', 'PUT')
    return api.postForm(`/api/products/${id}`, data)
  },

  deleteProduct(id: string): Promise<ApiResponse<null>> {
    return api.delete(`/api/products/${id}`)
  },
}
