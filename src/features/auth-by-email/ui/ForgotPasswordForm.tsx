'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useForm } from '@/shared/lib/useForm';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';

import { ForgotPasswordSchema } from '../model/schemas';
import { requestPasswordReset } from '../server/actions';

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    schema: ForgotPasswordSchema,
    defaultValues: { email: '' },
    onSubmit: async (data) => {
      const fd = new FormData();
      fd.set('email', data.email);
      const error = await requestPasswordReset(null, fd);
      if (!error) setSubmitted(true);
      return error;
    },
  });

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

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>Enter your email and we&apos;ll send a reset link.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-4">
          <FormField id="forgot-email" label="Email" error={form.fieldErrors.email}>
            <Input
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.values.email ?? ''}
              onChange={(e) => form.setValue('email', e.target.value)}
              aria-invalid={Boolean(form.fieldErrors.email)}
            />
          </FormField>
          {form.serverError ? (
            <p role="alert" className="text-destructive text-sm">
              {form.serverError}
            </p>
          ) : null}
          <Button type="submit" disabled={form.isPending} className="w-full">
            {form.isPending ? 'Sending…' : 'Send reset link'}
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
