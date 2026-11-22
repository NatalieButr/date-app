export function OnboardingProgressTestPage() {
  return (
    <div className="p-6 flex flex-col gap-8 max-w-md mx-auto">
      {([1, 2, 3] as const).map((displayStep) => (
        <section key={displayStep} aria-label={`Progress at display step ${displayStep}`}>
          <h2 className="text-sm font-semibold mb-3">Display step {displayStep} of 3</h2>
          <div
            role="progressbar"
            aria-valuenow={displayStep}
            aria-valuemin={1}
            aria-valuemax={3}
            aria-label="Onboarding progress"
            className="flex items-center gap-2"
          >
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s <= displayStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
