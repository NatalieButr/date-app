import { type NextRequest } from 'next/server';

import { wingmanConfirmPOST } from '@/features/wingman/server';

export async function POST(req: NextRequest) {
  return wingmanConfirmPOST(req);
}
