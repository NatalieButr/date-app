import { notFound } from 'next/navigation';

import { serverEnv } from '@/shared/config/env.server';
import { MatchModalTestPage } from '@/_pages/match-modal-test';

// Force dynamic so the env-var guard runs at request time, not at build time.
export const dynamic = 'force-dynamic';

export default function Page() {
  if (!serverEnv().USE_TEST_ROUTES) notFound();
  return <MatchModalTestPage />;
}
