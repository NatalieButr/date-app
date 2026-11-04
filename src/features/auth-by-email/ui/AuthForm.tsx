'use client';

import { useActionState } from 'react';

import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

import { signIn, signUp } from '../server/actions';

export function AuthForm() {
  const [signInError, signInAction, signInPending] = useActionState(signIn, null);
  const [signUpError, signUpAction, signUpPending] = useActionState(signUp, null);

  return (
    <Tabs defaultValue="login" className="w-full max-w-sm">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Sign in</TabsTrigger>
        <TabsTrigger value="register">Sign up</TabsTrigger>
      </TabsList>

      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Enter your email and password to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={signInAction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
              {signInError && (
                <p role="alert" className="text-destructive text-sm">
                  {signInError}
                </p>
              )}
              <Button type="submit" disabled={signInPending} className="w-full">
                {signInPending ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="register">
        <Card>
          <CardHeader>
            <CardTitle>Create account</CardTitle>
            <CardDescription>Sign up to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={signUpAction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </div>
              {signUpError && (
                <p role="alert" className="text-destructive text-sm">
                  {signUpError}
                </p>
              )}
              <Button type="submit" disabled={signUpPending} className="w-full">
                {signUpPending ? 'Creating account…' : 'Sign up'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
