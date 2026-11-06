import { type NextRequest } from 'next/server';

import { icebreakersPOST } from '@/features/icebreakers/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  return icebreakersPOST(req, matchId);
}
