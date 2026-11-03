import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Providers } from '@/_app/providers';
import '@/_app/styles/globals.css';

export const metadata: Metadata = {
  title: 'Spark',
  description: 'AI-powered dating app',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
