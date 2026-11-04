import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export const SignUpSchema = LoginSchema.extend({
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
