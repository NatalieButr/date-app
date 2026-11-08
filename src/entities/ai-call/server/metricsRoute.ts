import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';

import { getCurrentViewer, isAdmin } from '@/entities/viewer/server';
import { forbidden, unauthorized } from '@/shared/lib/http';

import { getAdminMetrics } from './index';

export async function adminMetricsGET(req: NextRequest): Promise<Response> {
  const viewer = await getCurrentViewer();
  if (!viewer) return unauthorized();

  if (!isAdmin(viewer.email)) {
    return forbidden();
  }

  const { searchParams } = req.nextUrl;
  const from = searchParams.get('from') ?? undefined;
  const to = searchParams.get('to') ?? undefined;

  const summary = await getAdminMetrics(from, to);
  return NextResponse.json(summary);
}
