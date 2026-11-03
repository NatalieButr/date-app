import type { ReactNode } from 'react';

// Сюда добавляются глобальные провайдеры (Toaster, QueryClient и т. п.)
export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  return <>{children}</>;
}
