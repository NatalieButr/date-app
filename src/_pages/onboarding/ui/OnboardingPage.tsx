'use client';

import { useState, useCallback } from 'react';
import {
  useOnboarding,
  BasicInfoForm,
  OnboardingChat,
  BioPicker,
  ExtractingStep,
  GeneratingBioStep,
  extractProfile,
  generateBio,
  saveProfile,
} from '@/features/onboarding';
import type { ChatMessage } from '@/features/onboarding';

const STEP_LABELS: Record<number, string> = {
  1: 'Basic info',
  2: 'Chat',
  3: 'Analyzing…',
  4: 'Your bio',
};

export function OnboardingPage() {
  const { state, setBasicInfo, setExtracted, setBioOptions, setChosenBio, setError, goToStep } =
    useOnboarding();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleChatDone = useCallback(async (finalMessages: ChatMessage[]) => {
    goToStep(3);
    try {
      const extracted = await extractProfile(finalMessages, state.basicInfo ?? undefined);
      setExtracted(extracted);
      const bioOpts = await generateBio(finalMessages, state.basicInfo ?? undefined);
      setBioOptions(bioOpts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze your answers. Please try again.');
      goToStep(2);
    }
  }, [goToStep, setExtracted, setBioOptions, setError]);

  const handleSave = useCallback(async () => {
    if (!state.basicInfo || !state.extracted || !state.chosenBio) return;
    setError(null);
    try {
      await saveProfile({
        basicInfo: state.basicInfo,
        extracted: state.extracted,
        bio: state.chosenBio,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile. Please try again.');
    }
  }, [state.basicInfo, state.extracted, state.chosenBio, setError]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  state.step >= s ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Step {state.step === 3 ? 2 : state.step === 4 ? 3 : state.step} of 3 —{' '}
            {STEP_LABELS[state.step]}
          </p>
        </div>

        <h1 className="text-2xl font-bold mb-6">
          {state.step === 1 && 'Tell us about yourself'}
          {state.step === 2 && "Let's get to know you"}
          {state.step === 3 && 'Analyzing your answers'}
          {state.step === 4 && 'Choose your bio'}
        </h1>

        {state.error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {state.error}
            <button
              onClick={() => setError(null)}
              className="ml-2 underline underline-offset-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {state.step === 1 && <BasicInfoForm onSubmit={setBasicInfo} />}

        {state.step === 2 && (
          <OnboardingChat
            messages={messages}
            onMessagesChange={setMessages}
            onDone={(finalMsgs) => void handleChatDone(finalMsgs)}
            basicInfo={state.basicInfo ?? undefined}
          />
        )}

        {state.step === 3 && <ExtractingStep />}

        {state.step === 4 && state.bioOptions && (
          <BioPicker
            options={state.bioOptions}
            chosenBio={state.chosenBio}
            onChoose={setChosenBio}
            onConfirm={() => void handleSave()}
          />
        )}

        {state.step === 4 && !state.bioOptions && <GeneratingBioStep />}
      </div>
    </main>
  );
}
