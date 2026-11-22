'use client';

import { ChatWindow } from '@/widgets/chat-window';
import { OnboardingChat } from '@/features/onboarding';

export function ChatLogTestPage() {
  return (
    <div className="flex flex-col gap-8 p-4">
      {/* Real ChatWindow — Supabase Realtime will fail silently with dummy credentials */}
      <div className="h-96 border rounded-lg overflow-hidden">
        <ChatWindow
          matchId="00000000-0000-0000-0000-000000000000"
          viewerId="00000000-0000-0000-0000-000000000001"
          initialMessages={[]}
          supabaseUrl="http://localhost:54321"
          supabaseKey="test-key"
        />
      </div>
      {/* Actual OnboardingChat component (purely client-side, no Supabase on mount) */}
      <OnboardingChat messages={[]} onMessagesChange={() => {}} onDone={() => {}} />
    </div>
  );
}
