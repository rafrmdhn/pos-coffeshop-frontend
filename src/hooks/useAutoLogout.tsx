import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function useAutoLogout() {
  const { token, logout } = useAuthStore();

  useEffect(() => {
    if (!token) return;

    // Checks token expiry - mocked for Phase 2
    const checkTokenExpiry = () => {
       // Placeholder for actual JWT decode validation
       // const decoded = jwtDecode(token);
    };

    const interval = setInterval(checkTokenExpiry, 60000); 

    return () => clearInterval(interval);
  }, [token, logout]);
}
