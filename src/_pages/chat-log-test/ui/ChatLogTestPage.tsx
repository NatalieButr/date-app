'use client';

import { OnboardingChat } from '@/features/onboarding';

export function ChatLogTestPage() {
  return (
    <div className="flex flex-col gap-8 p-4">
      {/* Structural fixture mirroring ChatWindow's message list (avoids Supabase Realtime in tests) */}
      <div
        role="log"
        aria-label="Conversation"
        aria-live="polite"
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2 min-h-0"
        data-testid="chat-window-log"
      >
        <p className="text-center text-muted-foreground text-sm py-8">
          No messages yet. Say hello!
        </p>
      </div>

      {/* Actual OnboardingChat component (purely client-side, no Supabase on mount) */}
      <OnboardingChat messages={[]} onMessagesChange={() => {}} onDone={() => {}} />
    </div>
  );
}
