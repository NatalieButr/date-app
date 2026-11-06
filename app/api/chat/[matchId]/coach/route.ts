import { type NextRequest } from 'next/server';

import { coachPOST } from '@/features/chat-coach/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  return coachPOST(req, matchId);
}
