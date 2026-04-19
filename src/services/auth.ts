import { api } from '@/lib/apiClient'
import type { AuthUser, ApiResponse } from '@/types/api'

interface AuthResponseData {
  token: string
  token_type: string
  expires_at: string
  user: AuthUser
}

export const login = (data: {
  email: string
  password: string
  device_name?: string
}): Promise<ApiResponse<AuthResponseData>> =>
  api.post('/api/auth/login', data)

export const pinLogin = (data: {
  pin: string
  outlet_id: string
}): Promise<ApiResponse<AuthResponseData>> =>
  api.post('/api/auth/pin', data)

export const logout = (): Promise<ApiResponse<null>> =>
  api.post('/api/auth/logout')

export const getMe = (): Promise<ApiResponse<AuthUser>> =>
  api.get('/api/auth/me')

export const setActiveOutletContext = (outlet_id: string): Promise<ApiResponse<{ message: string }>> =>
  api.post('/api/auth/context/outlet', { outlet_id })
