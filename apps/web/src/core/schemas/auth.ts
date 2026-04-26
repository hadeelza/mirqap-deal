import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('أدخل بريدًا إلكترونيًا صحيحًا'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
})

export const registerSchema = z
  .object({
    fullName: z.string().min(3, 'الاسم الكامل قصير جدًا'),
    email: z.string().email('أدخل بريدًا إلكترونيًا صحيحًا'),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    confirmPassword: z.string().min(6, 'تأكيد كلمة المرور مطلوب'),
    role: z.enum(['investor', 'entrepreneur'], {
      message: 'اختر نوع الحساب'
    })
  })
  .refine(values => values.password === values.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword']
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email('أدخل بريدًا إلكترونيًا صحيحًا')
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>