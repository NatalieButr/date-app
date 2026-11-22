'use client';

import { BioPicker, OnboardingChat } from '@/features/onboarding';
import { SendMessageForm } from '@/features/send-message';

const DUMMY_BIO_OPTIONS = {
  options: [
    { tone: 'casual', text: 'Just a person who loves coffee and long walks.' },
    { tone: 'witty', text: 'Professional overthinker. Amateur cook.' },
  ],
};

export function TextareaLabelsTestPage() {
  return (
    <div className="flex flex-col gap-10 p-6 max-w-xl mx-auto">
      <section aria-label="OnboardingChat textarea">
        <h2 className="text-sm font-semibold mb-3">OnboardingChat</h2>
        <OnboardingChat messages={[]} onMessagesChange={() => {}} onDone={() => {}} />
      </section>

      <section aria-label="SendMessageForm textarea">
        <h2 className="text-sm font-semibold mb-3">SendMessageForm</h2>
        <SendMessageForm matchId="00000000-0000-0000-0000-000000000000" />
      </section>

      <section aria-label="BioPicker textarea">
        <h2 className="text-sm font-semibold mb-3">BioPicker</h2>
        <BioPicker
          options={DUMMY_BIO_OPTIONS}
          chosenBio={DUMMY_BIO_OPTIONS.options[0]?.text ?? ''}
          onChoose={() => {}}
          onConfirm={() => {}}
        />
      </section>
    </div>
  );
}
