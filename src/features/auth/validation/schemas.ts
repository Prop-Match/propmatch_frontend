import { z } from "zod";
import { SignupRoleSchema } from "@/src/lib/api/contracts/auth";

export const loginFormSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(1, "أدخل كلمة المرور"),
});
export type LoginForm = z.infer<typeof loginFormSchema>;

export const signupFormSchema = z.object({
  fullName: z.string().min(2, "أدخل اسمك بالكامل"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  phone: z.string().regex(/^01\d{9}$/, "رقم هاتف مصري غير صالح"),
  password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل"),
  role: SignupRoleSchema,
});
export type SignupForm = z.infer<typeof signupFormSchema>;
