import { z } from 'zod';

// --- Basic info form (step 1) ---
export const BasicInfoSchema = z.object({
  name: z.string().min(1).max(60),
  age: z.number().int().min(18).max(99),
  gender: z.string().min(1).max(40),
  looking_for: z.array(z.string().min(1)).min(1).max(5),
  city: z.string().min(1).max(80),
});
export type BasicInfo = z.infer<typeof BasicInfoSchema>;

// --- Onboarding chat ---
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(2000),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(30),
  basicInfo: BasicInfoSchema.optional(),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// --- Profile extraction (step 3, H-zone) ---
export const ProfileExtractSchema = z.object({
  interests: z.array(z.string().min(2).max(40)).min(3).max(10),
  values: z.array(z.string().min(2).max(40)).min(2).max(6),
  seeking: z.string().max(200),
  red_flags: z.array(z.string().max(80)).max(5),
  summary: z.string().max(300),
});
export type ProfileExtract = z.infer<typeof ProfileExtractSchema>;

// --- Bio options (step 4) ---
export const BioOptionsSchema = z.object({
  options: z.array(
    z.object({
      tone: z.string().min(1).max(40),
      text: z.string().min(1).max(500),
    }),
  ).length(3),
});
export type BioOptions = z.infer<typeof BioOptionsSchema>;

// --- Save profile ---
export const SaveProfileSchema = z.object({
  basicInfo: BasicInfoSchema,
  extracted: ProfileExtractSchema,
  bio: z.string().min(1).max(500),
});
export type SaveProfileInput = z.infer<typeof SaveProfileSchema>;
