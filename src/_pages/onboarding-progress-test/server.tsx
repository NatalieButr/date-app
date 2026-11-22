import 'server-only';
import { notFound } from 'next/navigation';
import { serverEnv } from '@/shared/config/env.server';
import { OnboardingProgressTestPage } from './ui/OnboardingProgressTestPage';

export function OnboardingProgressTestRoute() {
  if (!serverEnv().USE_TEST_ROUTES) notFound();
  return <OnboardingProgressTestPage />;
}
