import { type NextRequest } from 'next/server';

import { listMessagesGET } from '@/entities/message/server';
import { sendMessagePOST } from '@/features/send-message/server';

interface RouteContext {
  params: Promise<{ matchId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { matchId } = await params;
  return listMessagesGET(req, matchId);
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { matchId } = await params;
  return sendMessagePOST(req, matchId);
}
