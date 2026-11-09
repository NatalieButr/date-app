'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

import { ForgotPasswordSchema } from '../model/schemas';
import { requestPasswordReset } from '../server/actions';

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [emailError, setEmailError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            If an account with that address exists, we sent a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const result = ForgotPasswordSchema.safeParse({ email: data.get('email') });
    if (!result.success) {
      setEmailError(result.error.issues[0]?.message ?? 'Invalid email');
      return;
    }
    setEmailError(null);
    setServerError(null);
    startTransition(async () => {
      const error = await requestPasswordReset(null, data);
      if (error) {
        setServerError(error);
      } else {
        setSubmitted(true);
      }
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>Enter your email and we&apos;ll send a reset link.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="forgot-email">Email</Label>
            <Input
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(emailError)}
            />
            {emailError && (
              <span role="alert" className="text-destructive text-sm">
                {emailError}
              </span>
            )}
          </div>
          {serverError && (
            <p role="alert" className="text-destructive text-sm">
              {serverError}
            </p>
          )}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Sending…' : 'Send reset link'}
          </Button>
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground text-center text-sm underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
