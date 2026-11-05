export type { ChatMessage, BasicInfo, ProfileExtract, BioOptions, SaveProfileInput } from './model/schemas';
export {
  ChatMessageSchema,
  ChatRequestSchema,
  BasicInfoSchema,
  ProfileExtractSchema,
  BioOptionsSchema,
  SaveProfileSchema,
} from './model/schemas';
export { useOnboarding, type OnboardingStep, type OnboardingState } from './model/useOnboarding';
export { streamChat, extractProfile, generateBio } from './api/onboardingClient';
export { BasicInfoForm } from './ui/BasicInfoForm';
export { OnboardingChat } from './ui/OnboardingChat';
export { BioPicker } from './ui/BioPicker';
export { ExtractingStep } from './ui/ExtractingStep';
export { GeneratingBioStep } from './ui/GeneratingBioStep';
// Server Action — 'use server' in saveProfile.ts, safe to re-export from client barrel
export { saveProfile } from './server/saveProfile';
