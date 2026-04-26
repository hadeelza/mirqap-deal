import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email("أدخل بريدًا إلكترونيًا صحيحًا"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(3, "الاسم الكامل مطلوب"),
    email: z.string().trim().email("أدخل بريدًا إلكترونيًا صحيحًا"),
    phone: z.string().trim().min(8, "رقم الجوال غير صحيح"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    confirmPassword: z.string().min(6, "تأكيد كلمة المرور مطلوب"),
    role: z.enum(["investor", "entrepreneur"] as const, {
      message: "اختر نوع الحساب",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export type SignInFormValues = z.infer<typeof signInSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;