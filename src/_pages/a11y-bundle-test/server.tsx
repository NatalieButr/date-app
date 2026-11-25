import 'server-only';

import { notFound } from 'next/navigation';

import { serverEnv } from '@/shared/config/env.server';

import { A11yBundleTestPage } from './ui/A11yBundleTestPage';

export function A11yBundleTestRoute() {
  if (!serverEnv().USE_TEST_ROUTES) notFound();
  return <A11yBundleTestPage />;
}
