import 'server-only';

import { notFound } from 'next/navigation';

import { serverEnv } from '@/shared/config/env.server';

import { ChatLogTestPage } from './ui/ChatLogTestPage';

export function ChatLogTestRoute() {
  if (!serverEnv().USE_TEST_ROUTES) notFound();
  return <ChatLogTestPage />;
}
