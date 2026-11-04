import { AuthForm } from '@/features/auth-by-email';

export function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Spark</h1>
        <p className="text-muted-foreground mt-1 text-sm">AI dating powered by Claude</p>
      </div>
      <AuthForm />
    </main>
  );
}
