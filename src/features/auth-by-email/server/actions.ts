'use server';
import 'server-only';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/shared/api/supabase/server';

import {
  ForgotPasswordSchema,
  LoginSchema,
  ResetPasswordSchema,
  SignUpSchema,
} from '../model/schemas';

export async function signIn(_prev: string | null, formData: FormData): Promise<string | null> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? 'Invalid data';
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return error.message;

  redirect('/feed');
}

export async function signUp(_prev: string | null, formData: FormData): Promise<string | null> {
  const parsed = SignUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? 'Invalid data';
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp(parsed.data);
  if (error) return error.message;

  redirect('/onboarding');
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function requestPasswordReset(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const parsed = ForgotPasswordSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? 'Invalid email';

  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const protocol = host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https';
  const redirectTo = `${protocol}://${host}/reset-password`;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo });
  if (error) return error.message;

  return null;
}

export async function resetPassword(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const parsed = ResetPasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? 'Invalid password';

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return error.message;

  redirect('/login');
}
