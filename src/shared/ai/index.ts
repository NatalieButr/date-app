import 'server-only';

// Единственная точка доступа к Claude и Voyage (SPEC §7).
export type { Feature, CallOptions } from './complete';
export { complete } from './complete';
export { stream } from './stream';
export { structured } from './structured';
export { embed } from './embeddings';
export { rateLimit } from './rate-limit';
export { AiCallError, StructuredOutputError, RateLimitError } from './errors';
export { modelFor, type ModelTier } from './models';
