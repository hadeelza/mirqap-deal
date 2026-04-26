import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type StatusBadgeProps = {
  children: ReactNode
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}

export function StatusBadge({ children, variant = 'neutral' }: StatusBadgeProps) {
  return <span className={cn('status-badge', `status-badge--${variant}`)}>{children}</span>
}