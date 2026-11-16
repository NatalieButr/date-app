'use client';

import { useEffect, useState } from 'react';

import { useForm } from '@/shared/lib/useForm';
import { createSupabaseBrowserClient } from '@/shared/api/supabase/browser';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';

import { ResetPasswordSchema } from '../model/schemas';
import { resetPassword } from '../server/actions';

export function ResetPasswordForm() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    // Only unlock the form for a genuine password-recovery link; SIGNED_IN alone
    // (e.g. a logged-in user navigating to /reset-password) must not silently allow
    // setting a new password without the user's current password.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
    // PKCE flow: proxy has already exchanged the code, so by mount time the session
    // exists but PASSWORD_RECOVERY may never fire. Check for the aal1 recovery session.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user.aud === 'authenticated' && data.session.user.recovery_sent_at) {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-sm">Verifying reset link…</p>
        </CardContent>
      </Card>
    );
  }

  return <ResetForm />;
}

function ResetForm() {
  const form = useForm({
    schema: ResetPasswordSchema,
    defaultValues: { password: '', confirmPassword: '' },
    onSubmit: async (data) => {
      // confirmPassword validates client-side only — append to FormData so server action can re-verify
      const fd = new FormData();
      fd.set('password', data.password);
      fd.set('confirmPassword', data.confirmPassword);
      return resetPassword(null, fd);
    },
  });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Set new password</CardTitle>
        <CardDescription>Choose a strong password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-4">
          <FormField id="reset-password" label="New password" error={form.fieldErrors.password}>
            <Input
              id="reset-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.values.password ?? ''}
              onChange={(e) => form.setValue('password', e.target.value)}
              aria-invalid={Boolean(form.fieldErrors.password)}
            />
          </FormField>
          <FormField
            id="reset-confirm-password"
            label="Confirm new password"
            error={form.fieldErrors.confirmPassword}
          >
            <Input
              id="reset-confirm-password"
              type="password"
              autoComplete="new-password"
              value={form.values.confirmPassword ?? ''}
              onChange={(e) => form.setValue('confirmPassword', e.target.value)}
              aria-invalid={Boolean(form.fieldErrors.confirmPassword)}
            />
          </FormField>
          {form.serverError ? (
            <p role="alert" className="text-destructive text-sm">
              {form.serverError}
            </p>
          ) : null}
          <Button type="submit" disabled={form.isPending} className="w-full">
            {form.isPending ? 'Saving…' : 'Set password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
