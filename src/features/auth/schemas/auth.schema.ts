import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'El correo electrónico es requerido' })
    .email({ message: 'Por favor ingresa un correo electrónico válido' })
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    .regex(/[A-Z]/, { message: 'La contraseña debe contener al menos una letra mayúscula' })
    .regex(/[a-z]/, { message: 'La contraseña debe contener al menos una letra minúscula' })
    .regex(/[0-9]/, { message: 'La contraseña debe contener al menos un número' })
    .regex(/[^a-zA-Z0-9]/, { message: 'La contraseña debe contener al menos un carácter especial' }),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Schema for registration form
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
      .max(50, { message: 'El nombre no puede tener más de 50 caracteres' })
      .trim(),
    email: z
      .string()
      .min(1, { message: 'El correo electrónico es requerido' })
      .email({ message: 'Por favor ingresa un correo electrónico válido' })
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
      .regex(/[A-Z]/, { message: 'La contraseña debe contener al menos una letra mayúscula' })
      .regex(/[a-z]/, { message: 'La contraseña debe contener al menos una letra minúscula' })
      .regex(/[0-9]/, { message: 'La contraseña debe contener al menos un número' })
      .regex(/[^a-zA-Z0-9]/, { message: 'La contraseña debe contener al menos un carácter especial' }),
    confirmPassword: z.string(),
    terms: z.literal(true, {
      errorMap: () => ({ message: 'Debes aceptar los términos y condiciones' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Schema for password reset request
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'El correo electrónico es requerido' })
    .email({ message: 'Por favor ingresa un correo electrónico válido' })
    .trim()
    .toLowerCase(),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Schema for reset password
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
      .regex(/[A-Z]/, { message: 'La contraseña debe contener al menos una letra mayúscula' })
      .regex(/[a-z]/, { message: 'La contraseña debe contener al menos una letra minúscula' })
      .regex(/[0-9]/, { message: 'La contraseña debe contener al menos un número' })
      .regex(/[^a-zA-Z0-9]/, { message: 'La contraseña debe contener al menos un carácter especial' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
