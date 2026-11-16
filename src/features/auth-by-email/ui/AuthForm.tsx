'use client';

import Link from 'next/link';

import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { useForm } from '@/shared/lib/useForm';

import { LoginSchema, SignUpFormSchema } from '../model/schemas';
import { signIn, signUp } from '../server/actions';

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
  const form = useForm({
    schema: LoginSchema,
    defaultValues: { email: '', password: '' },
    onSubmit: async (data) => {
      const fd = new FormData();
      fd.set('email', data.email);
      fd.set('password', data.password);
      return signIn(null, fd);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Enter your email and password to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-4">
          <FormField id="login-email" label="Email" error={form.fieldErrors.email}>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.values.email ?? ''}
              onChange={(e) => form.setValue('email', e.target.value)}
              aria-invalid={Boolean(form.fieldErrors.email)}
            />
          </FormField>
          <FormField id="login-password" label="Password" error={form.fieldErrors.password}>
            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.values.password ?? ''}
              onChange={(e) => form.setValue('password', e.target.value)}
              aria-invalid={Boolean(form.fieldErrors.password)}
            />
          </FormField>
          <Link
            href="/forgot-password"
            className="text-muted-foreground hover:text-foreground self-end text-sm underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
          {form.serverError ? (
            <p role="alert" className="text-destructive text-sm">
              {form.serverError}
            </p>
          ) : null}
          <Button type="submit" disabled={form.isPending} className="w-full">
            {form.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SignUpCard() {
  const form = useForm({
    schema: SignUpFormSchema,
    defaultValues: { email: '', password: '', confirmPassword: '' },
    onSubmit: async (data) => {
      // confirmPassword is validated client-side only — never sent to the server
      const fd = new FormData();
      fd.set('email', data.email);
      fd.set('password', data.password);
      return signUp(null, fd);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Sign up to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-4">
          <FormField id="signup-email" label="Email" error={form.fieldErrors.email}>
            <Input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.values.email ?? ''}
              onChange={(e) => form.setValue('email', e.target.value)}
              aria-invalid={Boolean(form.fieldErrors.email)}
            />
          </FormField>
          <FormField id="signup-password" label="Password" error={form.fieldErrors.password}>
            <Input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.values.password ?? ''}
              onChange={(e) => form.setValue('password', e.target.value)}
              aria-invalid={Boolean(form.fieldErrors.password)}
            />
          </FormField>
          <FormField
            id="signup-confirm-password"
            label="Confirm password"
            error={form.fieldErrors.confirmPassword}
          >
            <Input
              id="signup-confirm-password"
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
            {form.isPending ? 'Creating account…' : 'Sign up'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
