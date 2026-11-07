import 'server-only';

export { getMyMatches, getMatchForViewer, getMatchByTarget } from './server/index';
export type { Match, MatchRow } from './model/schemas';
