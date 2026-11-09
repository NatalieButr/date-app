'use client';

import { useEffect, useState, useTransition } from 'react';

import { createSupabaseBrowserClient } from '@/shared/api/supabase/browser';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

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
  const [isPending, startTransition] = useTransition();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<'password' | 'confirmPassword', string>>
  >({});
  const [serverError, setServerError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const result = ResetPasswordSchema.safeParse({
      password: data.get('password'),
      confirmPassword,
    });
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setFieldErrors({
        password: flat.password?.[0],
        confirmPassword: flat.confirmPassword?.[0],
      });
      return;
    }
    setFieldErrors({});
    setServerError(null);
    // Append confirmPassword so the server action can re-validate the match.
    data.set('confirmPassword', confirmPassword);
    startTransition(async () => {
      const error = await resetPassword(null, data);
      if (error) setServerError(error);
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Set new password</CardTitle>
        <CardDescription>Choose a strong password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-password">New password</Label>
            <Input
              id="reset-password"
              name="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(fieldErrors.password)}
            />
            {fieldErrors.password && (
              <span role="alert" className="text-destructive text-sm">
                {fieldErrors.password}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-confirm-password">Confirm new password</Label>
            <Input
              id="reset-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
            />
            {fieldErrors.confirmPassword && (
              <span role="alert" className="text-destructive text-sm">
                {fieldErrors.confirmPassword}
              </span>
            )}
          </div>
          {serverError && (
            <p role="alert" className="text-destructive text-sm">
              {serverError}
            </p>
          )}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Saving…' : 'Set password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
