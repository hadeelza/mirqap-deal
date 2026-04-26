import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { AppSidebar } from '@/core/components/layout/AppSidebar'
import { AppTopbar } from '@/core/components/layout/AppTopbar'

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="dashboard-shell">
      <AppSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="dashboard-main">
        <AppTopbar onMenuClick={() => setMobileOpen(true)} />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}