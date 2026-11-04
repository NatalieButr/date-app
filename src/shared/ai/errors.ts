import 'server-only';

export class AiCallError extends Error {
  constructor(
    message: string,
    public readonly httpStatus?: number,
    public override readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AiCallError';
  }
}

export class StructuredOutputError extends Error {
  constructor(
    message: string,
    public readonly lastValidationError?: string,
  ) {
    super(message);
    this.name = 'StructuredOutputError';
  }
}

export class RateLimitError extends Error {
  constructor(
    public readonly bucket: string,
    public readonly retryAfterMs?: number,
  ) {
    super(`Rate limit exceeded for bucket: ${bucket}`);
    this.name = 'RateLimitError';
  }
}
