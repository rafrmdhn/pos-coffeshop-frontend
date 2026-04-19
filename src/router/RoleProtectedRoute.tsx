import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

/**
 * A wrapper for routes that requires the user to have at least one of the specified roles.
 * If not authorized, redirects to an appropriate landing page based on the user's role.
 */
export function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
  const { user, token, hasRole } = useAuthStore();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAuthorized = allowedRoles.some(role => hasRole(role));

  if (!isAuthorized) {
    // Redirect unauthorized users to their primary dashboard
    const redirectPath = hasRole('cashier') ? '/pos' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
