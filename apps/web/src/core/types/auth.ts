import type { Session, User } from '@supabase/supabase-js'

export type UserRole = 'admin' | 'investor' | 'entrepreneur'

export type AuthActionResult = {
  success: boolean
  message: string
  role?: UserRole
  requiresEmailConfirmation?: boolean
}

export type AuthContextValue = {
  session: Session | null
  user: User | null
  role: UserRole | null
  isLoading: boolean
  signIn: (values: { email: string; password: string }) => Promise<AuthActionResult>
  signUp: (values: {
    fullName: string
    email: string
    password: string
    confirmPassword: string
    role: UserRole
  }) => Promise<AuthActionResult>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<AuthActionResult>
}

export type NavItem = {
  label: string
  href: string
  icon: string
}