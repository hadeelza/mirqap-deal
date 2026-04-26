import type { UserRole } from '@/shared/types/auth'

export const roleHomeRoutes: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  investor: '/investor/dashboard',
  entrepreneur: '/entrepreneur/dashboard'
}

export function getDefaultRoute(role: UserRole) {
  return roleHomeRoutes[role]
}