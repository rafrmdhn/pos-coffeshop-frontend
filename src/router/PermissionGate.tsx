import { useAuthStore } from '@/stores/authStore'

interface Props {
  permission: string;
  children: React.ReactNode;
}

export function PermissionGate({ permission, children }: Props) {
  const { hasPermission } = useAuthStore()

  if (!hasPermission(permission)) {
    return <div className="p-4 text-center text-red-500">Access Denied</div>
  }

  return <>{children}</>
}
