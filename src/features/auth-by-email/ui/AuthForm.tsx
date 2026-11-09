'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

import { LoginSchema, SignUpFormSchema } from '../model/schemas';
import { signIn, signUp } from '../server/actions';

type FieldErrors<K extends string> = Partial<Record<K, string>>;

export function AuthForm() {
  return (
    <Tabs defaultValue="login" className="w-full max-w-sm">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Sign in</TabsTrigger>
        <TabsTrigger value="register">Sign up</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <SignInCard />
      </TabsContent>
      <TabsContent value="register">
        <SignUpCard />
      </TabsContent>
    </Tabs>
  );
}

function SignInCard() {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<'email' | 'password'>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const result = LoginSchema.safeParse({
      email: data.get('email'),
      password: data.get('password'),
    });
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setFieldErrors({ email: flat.email?.[0], password: flat.password?.[0] });
      return;
    }
    setFieldErrors({});
    setServerError(null);
    startTransition(async () => {
      const error = await signIn(null, data);
      if (error) setServerError(error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Enter your email and password to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <FormField id="login-email" label="Email" error={fieldErrors.email}>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(fieldErrors.email)}
            />
          </FormField>
          <FormField id="login-password" label="Password" error={fieldErrors.password}>
            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(fieldErrors.password)}
            />
          </FormField>
          <Link
            href="/forgot-password"
            className="text-muted-foreground hover:text-foreground self-end text-sm underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
          {serverError ? (
            <p role="alert" className="text-destructive text-sm">
              {serverError}
            </p>
          ) : null}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SignUpCard() {
  const [isPending, startTransition] = useTransition();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    FieldErrors<'email' | 'password' | 'confirmPassword'>
  >({});
  const [serverError, setServerError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const result = SignUpFormSchema.safeParse({
      email: data.get('email'),
      password: data.get('password'),
      confirmPassword,
    });
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setFieldErrors({
        email: flat.email?.[0],
        password: flat.password?.[0],
        confirmPassword: flat.confirmPassword?.[0],
      });
      return;
    }
    setFieldErrors({});
    setServerError(null);
    // confirmPassword lives in state only — not in FormData, never sent to the server.
    startTransition(async () => {
      const error = await signUp(null, data);
      if (error) setServerError(error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Sign up to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <FormField id="signup-email" label="Email" error={fieldErrors.email}>
            <Input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(fieldErrors.email)}
            />
          </FormField>
          <FormField id="signup-password" label="Password" error={fieldErrors.password}>
            <Input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(fieldErrors.password)}
            />
          </FormField>
          <FormField
            id="signup-confirm-password"
            label="Confirm password"
            error={fieldErrors.confirmPassword}
          >
            <Input
              id="signup-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
            />
          </FormField>
          {serverError ? (
            <p role="alert" className="text-destructive text-sm">
              {serverError}
            </p>
          ) : null}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Creating account…' : 'Sign up'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
