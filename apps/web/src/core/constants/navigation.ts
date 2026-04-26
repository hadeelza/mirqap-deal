import {
    Bell,
    BriefcaseBusiness,
    FileText,
    Handshake,
    LayoutDashboard,
    MessageSquare,
    Settings,
    Sparkles,
    Users
  } from 'lucide-react'
  import type { LucideIcon } from 'lucide-react'
  import type { UserRole } from '@/core/types/auth'
  
  export type SidebarNavItem = {
    label: string
    href: string
    icon: LucideIcon
  }
  
  export const sidebarItems: Record<UserRole, SidebarNavItem[]> = {
    admin: [
      { label: 'لوحة التحكم', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'المستخدمون', href: '/admin/dashboard', icon: Users },
      { label: 'المشاريع', href: '/admin/dashboard', icon: BriefcaseBusiness },
      { label: 'العروض', href: '/admin/dashboard', icon: Handshake },
      { label: 'التحليلات', href: '/admin/dashboard', icon: Sparkles },
      { label: 'الإشعارات', href: '/admin/dashboard', icon: Bell },
      { label: 'الإعدادات', href: '/admin/dashboard', icon: Settings }
    ],
    investor: [
      { label: 'الرئيسية', href: '/investor/dashboard', icon: LayoutDashboard },
      { label: 'استكشاف المشاريع', href: '/investor/dashboard', icon: BriefcaseBusiness },
      { label: 'العروض الاستثمارية', href: '/investor/dashboard', icon: Handshake },
      { label: 'الصفقات', href: '/investor/dashboard', icon: FileText },
      { label: 'الرسائل', href: '/investor/dashboard', icon: MessageSquare },
      { label: 'الإشعارات', href: '/investor/dashboard', icon: Bell },
      { label: 'الإعدادات', href: '/investor/dashboard', icon: Settings }
    ],
    entrepreneur: [
      { label: 'الرئيسية', href: '/entrepreneur/dashboard', icon: LayoutDashboard },
      { label: 'مشاريعي', href: '/entrepreneur/dashboard', icon: BriefcaseBusiness },
      { label: 'التحليل الذكي', href: '/entrepreneur/dashboard', icon: Sparkles },
      { label: 'العروض المستلمة', href: '/entrepreneur/dashboard', icon: Handshake },
      { label: 'الرسائل', href: '/entrepreneur/dashboard', icon: MessageSquare },
      { label: 'الإشعارات', href: '/entrepreneur/dashboard', icon: Bell },
      { label: 'الإعدادات', href: '/entrepreneur/dashboard', icon: Settings }
    ]
  }