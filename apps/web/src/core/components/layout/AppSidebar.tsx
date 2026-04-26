import { Menu, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { APP_NAME } from '@/shared/constants/app'
import { sidebarItems } from '@/shared/constants/navigation'
import { useAuth } from '@/shared/hooks/useAuth'
import { cn } from '@/shared/lib/cn'

type AppSidebarProps = {
  mobileOpen: boolean
  onClose: () => void
}

export function AppSidebar({ mobileOpen, onClose }: AppSidebarProps) {
  const { role } = useAuth()
  const items = role ? sidebarItems[role] : []

  return (
    <>
      <button type="button" className="mobile-menu-button" onClick={onClose}>
        <Menu size={20} />
      </button>

      <aside className={cn('app-sidebar', mobileOpen && 'is-open')}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand" onClick={onClose}>
            <span className="brand-dot">م</span>
            <div>
              <strong>{APP_NAME}</strong>
              <p>منصة الاستثمار التقني</p>
            </div>
          </Link>

          <button type="button" className="icon-button sidebar-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {items.map(item => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.label}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) => cn('sidebar-link', isActive && 'is-active')}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>

      {mobileOpen ? <div className="sidebar-overlay" onClick={onClose} /> : null}
    </>
  )
}