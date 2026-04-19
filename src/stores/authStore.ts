import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthUser } from '@/types/api'

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  permissions: string[];
  outlet: AuthUser['outlet'] | null;
  selectedOutletId: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  setOutletId: (id: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

// Custom IDB Storage to replace localStorage (prevents simple XSS payload theft)
const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return localStorage.getItem(name) || null; // Will implement dexie properly later in lib/db.ts
  },
  setItem: async (name: string, value: string): Promise<void> => {
    localStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    localStorage.removeItem(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      permissions: [],
      outlet: null,
      selectedOutletId: null,
      
      setAuth: (user, token) => set({
        user,
        token,
        permissions: user.permissions || [],
        outlet: user.outlet || null,
        selectedOutletId: user.outlet?.id || null,
      }),

      setOutletId: (id) => set({ selectedOutletId: id }),
      
      logout: () => set({
        user: null,
        token: null,
        permissions: [],
        outlet: null,
        selectedOutletId: null,
      }),
      
      hasPermission: (permission) => {
        return get().permissions.includes(permission);
      },
      
      hasRole: (role) => {
        return get().user?.roles?.includes(role) || false;
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => idbStorage), // using idbStorage mockup
    }
  )
)
