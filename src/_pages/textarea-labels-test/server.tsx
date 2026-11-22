import 'server-only';

import { notFound } from 'next/navigation';

import { serverEnv } from '@/shared/config/env.server';

import { TextareaLabelsTestPage } from './ui/TextareaLabelsTestPage';

export function TextareaLabelsTestRoute() {
  if (!serverEnv().USE_TEST_ROUTES) notFound();
  return <TextareaLabelsTestPage />;
}
