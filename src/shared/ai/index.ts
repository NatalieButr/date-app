import 'server-only';

// Единственная точка доступа к Claude и Voyage (SPEC §7).
// TODO(T-03): complete, stream, structured, embed, rateLimit, логирование в ai_calls, ретраи, фолбэк.
export { getAnthropic } from './client';
export { modelFor, type ModelTier } from './models';
