/**
 * Central HTTP client for the POS API.
 * Base URL: https://api-pos-coffeeshop.azbagas.com
 *
 * All requests automatically:
 *  - Attach Authorization: Bearer <token> from localStorage
 *  - Set Accept: application/json
 *  - Throw structured ApiError on non-2xx responses
 */

import { useAuthStore } from '@/stores/authStore'

export const API_BASE = 'https://api-pos-coffeeshop.azbagas.com'

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

function getToken(): string | null {
  try {
    // Try Zustand store first, fall back to raw localStorage parse
    const token = useAuthStore.getState().token
    if (token) return token
    const raw = localStorage.getItem('auth-storage')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.state?.token ?? null
  } catch {
    return null
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  let json: any
  try {
    json = await res.json()
  } catch {
    throw new ApiError(res.status, `HTTP ${res.status}: ${res.statusText}`)
  }

  if (!res.ok) {
    // 401 → force logout
    if (res.status === 401) {
      useAuthStore.getState().logout()
    }
    throw new ApiError(res.status, json?.message ?? 'Request failed', json?.errors)
  }

  return json as T
}

type RequestOptions = {
  params?: Record<string, string | number | boolean | undefined | null>
  body?: unknown
  formData?: FormData
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
}

export async function apiRequest<T = unknown>(
  path: string,
  { params, body, formData, method = 'GET' }: RequestOptions = {}
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`)

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
    })
  }

  const token = getToken()
  const outletId = useAuthStore.getState().selectedOutletId
  
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  if (token) headers.Authorization = `Bearer ${token}`
  if (outletId) headers['X-Outlet-ID'] = outletId

  let bodyInit: BodyInit | undefined
  if (formData) {
    // let browser set Content-Type with boundary for multipart
    bodyInit = formData
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    bodyInit = JSON.stringify(body)
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: bodyInit,
  })

  return handleResponse<T>(res)
}

// Convenience helpers
export const api = {
  get:    <T>(path: string, opts?: Omit<RequestOptions, 'method'>) =>
            apiRequest<T>(path, { ...opts, method: 'GET' }),
  post:   <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
            apiRequest<T>(path, { ...opts, body, method: 'POST' }),
  put:    <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
            apiRequest<T>(path, { ...opts, body, method: 'PUT' }),
  patch:  <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
            apiRequest<T>(path, { ...opts, body, method: 'PATCH' }),
  delete: <T>(path: string, body?: unknown) =>
            apiRequest<T>(path, { body, method: 'DELETE' }),
  postForm: <T>(path: string, formData: FormData) =>
            apiRequest<T>(path, { formData, method: 'POST' }),
  putForm: <T>(path: string, formData: FormData) =>
            apiRequest<T>(path, { formData, method: 'POST' }), // Laravel uses POST+_method for multipart
}
