import { NextResponse } from 'next/server';

interface ErrorBody {
  error: { code: string; message: string };
}

export function httpError(status: number, code: string, message: string): NextResponse<ErrorBody> {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function badRequest(code: string, message: string) {
  return httpError(400, code, message);
}

export function unauthorized() {
  return httpError(401, 'unauthorized', 'Authentication required');
}

export function forbidden() {
  return httpError(403, 'forbidden', 'Access denied');
}

export function rateLimited() {
  return httpError(429, 'rate_limited', 'Too many requests');
}

export function aiGatewayError() {
  return httpError(502, 'ai_error', 'AI service unavailable after retries');
}
