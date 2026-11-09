import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

const strongPassword = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .refine((v) => /[A-Z]/.test(v), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((v) => /[0-9]/.test(v), { message: 'Password must contain at least one digit' })
  .refine((v) => /[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?`~]/.test(v), {
    message: 'Password must contain at least one special character',
  });

export const SignUpSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }),
  password: strongPassword,
});

// Client-side only: adds confirmPassword and match check. Never sent to the server.
export const SignUpFormSchema = SignUpSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }),
});

export const ResetPasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
