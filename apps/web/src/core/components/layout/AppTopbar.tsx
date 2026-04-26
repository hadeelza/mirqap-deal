import { LogOut, Menu } from 'lucide-react'
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import { useAuth } from '@/shared/hooks/useAuth'

type AppTopbarProps = {
  onMenuClick: () => void
}

const pageTitleMap: Record<string, string> = {
  '/admin/dashboard': 'لوحة تحكم الأدمن',
  '/investor/dashboard': 'لوحة المستثمر',
  '/entrepreneur/dashboard': 'لوحة رائد الأعمال'
}

export function AppTopbar({ onMenuClick }: AppTopbarProps) {
  const { pathname } = useLocation()
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()

  const title = useMemo(() => pageTitleMap[pathname] ?? 'مرقاب ديل', [pathname])

  const handleLogout = async () => {
    await signOut()
    toast.success('تم تسجيل الخروج')
    navigate('/login', { replace: true })
  }

  return (
    <header className="topbar">
      <div className="topbar-right">
        <button type="button" className="icon-button topbar-menu" onClick={onMenuClick}>
          <Menu size={18} />
        </button>
        <div>
          <h2>{title}</h2>
          <p>{user?.user_metadata?.full_name ?? user?.email ?? 'مستخدم'}</p>
        </div>
      </div>

      <div className="topbar-left">
        <span className="topbar-role">
          {role === 'admin' ? 'أدمن' : role === 'investor' ? 'مستثمر' : 'رائد أعمال'}
        </span>

        <Button variant="ghost" size="sm" leftIcon={<LogOut size={16} />} onClick={handleLogout}>
          خروج
        </Button>
      </div>
    </header>
  )
}