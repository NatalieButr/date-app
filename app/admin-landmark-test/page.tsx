import { notFound } from 'next/navigation';

import { serverEnv } from '@/shared/config/env.server';
import { AdminLandmarkTestPage } from '@/_pages/admin-landmark-test';

// Force dynamic so the env-var guard runs at request time, not at build time.
export const dynamic = 'force-dynamic';

export default function Page() {
  if (!serverEnv().USE_TEST_ROUTES) notFound();
  return <AdminLandmarkTestPage />;
}
