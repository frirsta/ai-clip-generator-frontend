'use client';

import { PROCESSING_STEPS } from '@/lib/api';

/**
 * @param {string} activeStepId - step currently in progress
 * @param {string[]} completedStepIds - steps already finished
 */
export default function ProcessingPanel({ activeStepId, completedStepIds }) {
  return (
    <div className="animate-fadeUp rounded-lg border border-ink-600 bg-ink-850 p-8">
      <div className="flex items-center gap-3">
        <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-accent" />
        <h2 className="font-display text-base font-medium text-text-primary">
          Processing your video
        </h2>
      </div>
      <p className="mt-1.5 text-sm text-text-secondary">
        This usually takes a few minutes depending on video length.
      </p>

      <ol className="mt-7 flex flex-col">
        {PROCESSING_STEPS.map((step, index) => {
          const isDone = completedStepIds.includes(step.id);
          const isActive = step.id === activeStepId;
          const isLast = index === PROCESSING_STEPS.length - 1;

          return (
            <li key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <StepMarker isDone={isDone} isActive={isActive} />
                {!isLast && (
                  <span
                    className={`w-px flex-1 ${
                      isDone ? 'bg-accent/40' : 'bg-ink-600'
                    }`}
                    style={{ minHeight: '28px' }}
                  />
                )}
              </div>
              <div className="pb-7">
                <p
                  className={`text-sm transition-colors ${
                    isActive
                      ? 'font-medium text-text-primary'
                      : isDone
                        ? 'text-text-secondary'
                        : 'text-text-tertiary'
                  }`}
                >
                  {step.label}
                </p>
                {isActive && (
                  <p className="mt-0.5 font-mono text-xs text-accent">in progress</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StepMarker({ isDone, isActive }) {
  if (isDone) {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent">
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
          <path
            d="M3.5 8.5l3 3 6-6.5"
            stroke="#0B0C0E"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (isActive) {
    return (
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <span className="absolute h-5 w-5 animate-ping rounded-full bg-accent/30" />
        <span className="relative h-2 w-2 rounded-full bg-accent" />
      </span>
    );
  }
  return <span className="h-5 w-5 shrink-0 rounded-full border border-ink-600" />;
}
