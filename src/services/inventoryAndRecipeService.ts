import { api } from '@/lib/apiClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

// ── Raw Material (Inventory) types ────────────────────────────────────────────
export interface RawMaterial {
  id: string
  outlet_id: string
  name: string
  unit: string
  current_stock: number
  min_stock: number
  cost_per_unit: number
  is_low_stock: boolean
  last_restock_at: string | null
  created_at: string
  updated_at: string
}

export interface RecipeItem {
  id: string
  raw_material_id: string
  raw_material: { id: string; name: string; unit: string; cost_per_unit: number }
  quantity_needed: number
  estimated_cost: number
}

// ── Inventory Service ─────────────────────────────────────────────────────────
export const inventoryService = {
  getInventory(params?: {
    search?: string
    is_low_stock?: boolean
    page?: number
    per_page?: number
  }): Promise<PaginatedResponse<RawMaterial>> {
    return api.get('/api/inventory', { params: { per_page: 100, ...params } })
  },

  createMaterial(data: {
    name: string
    unit: string
    current_stock?: number
    min_stock?: number
    cost_per_unit: number
  }): Promise<ApiResponse<RawMaterial>> {
    return api.post('/api/inventory', data)
  },

  updateMaterial(
    id: string,
    data: {
      name?: string
      unit?: string
      current_stock?: number
      min_stock?: number
      cost_per_unit?: number
    }
  ): Promise<ApiResponse<RawMaterial>> {
    return api.put(`/api/inventory/${id}`, data)
  },

  deleteMaterial(id: string): Promise<ApiResponse<null>> {
    return api.delete(`/api/inventory/${id}`)
  },
}

// ── Recipe Service ────────────────────────────────────────────────────────────
export const recipeService = {
  getRecipe(productId: string): Promise<ApiResponse<RecipeItem[]>> {
    return api.get(`/api/products/${productId}/recipe`)
  },

  updateRecipe(
    productId: string,
    ingredients: { raw_material_id: string; quantity_needed: number }[]
  ): Promise<ApiResponse<RecipeItem[]>> {
    return api.put(`/api/products/${productId}/recipe`, { ingredients })
  },
}
