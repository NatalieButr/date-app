import { type NextRequest } from 'next/server';

import { wingmanPOST } from '@/features/wingman/server';

export async function POST(req: NextRequest) {
  return wingmanPOST(req);
}
