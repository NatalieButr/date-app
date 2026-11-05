'use client';

import { useState, useCallback } from 'react';
import type { BasicInfo, ProfileExtract, BioOptions } from './schemas';

export type OnboardingStep = 1 | 2 | 3 | 4;

export interface OnboardingState {
  step: OnboardingStep;
  basicInfo: BasicInfo | null;
  extracted: ProfileExtract | null;
  bioOptions: BioOptions | null;
  chosenBio: string;
  error: string | null;
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    step: 1,
    basicInfo: null,
    extracted: null,
    bioOptions: null,
    chosenBio: '',
    error: null,
  });

  const setBasicInfo = useCallback((info: BasicInfo) => {
    setState((s) => ({ ...s, basicInfo: info, step: 2, error: null }));
  }, []);

  const setExtracted = useCallback((extracted: ProfileExtract) => {
    setState((s) => ({ ...s, extracted, step: 4, error: null }));
  }, []);

  const setBioOptions = useCallback((bioOptions: BioOptions) => {
    setState((s) => ({ ...s, bioOptions, chosenBio: bioOptions.options[0]?.text ?? '' }));
  }, []);

  const setChosenBio = useCallback((bio: string) => {
    setState((s) => ({ ...s, chosenBio: bio }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((s) => ({ ...s, error }));
  }, []);

  const goToStep = useCallback((step: OnboardingStep) => {
    setState((s) => ({ ...s, step, error: null }));
  }, []);

  return { state, setBasicInfo, setExtracted, setBioOptions, setChosenBio, setError, goToStep };
}
