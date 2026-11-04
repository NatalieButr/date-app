'use server';
import 'server-only';

import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/shared/api/supabase/server';

import { LoginSchema, SignUpSchema } from '../model/schemas';

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
