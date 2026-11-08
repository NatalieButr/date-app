import { AuthForm } from '@/features/auth-by-email';
import { DemoLoginButton } from '@/features/demo-login';
import { serverEnv } from '@/shared/config/env.server';

export function LoginPage() {
  const { DEMO_USER_EMAIL } = serverEnv();
  const demoEnabled = Boolean(DEMO_USER_EMAIL);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Spark</h1>
        <p className="text-muted-foreground mt-1 text-sm">AI dating powered by Claude</p>
      </div>
      <AuthForm />
      {demoEnabled && (
        <div className="flex w-full max-w-sm flex-col items-center gap-3">
          <div className="flex w-full items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-muted-foreground text-xs">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <DemoLoginButton className="w-full" />
        </div>
      )}
    </main>
  );
}
