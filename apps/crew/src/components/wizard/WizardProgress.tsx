'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
  isOptional?: boolean;
}

interface WizardProgressProps {
  steps: Step[];
  currentStep: number;
  skippedSteps?: number[];
}

export function WizardProgress({ steps, currentStep, skippedSteps = [] }: WizardProgressProps) {
  return (
    <div className="px-4 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep || skippedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isSkipped = skippedSteps.includes(step.id);
          const isUpcoming = step.id > currentStep && !isSkipped;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    isCompleted && 'bg-success text-white',
                    isCurrent && 'bg-primary text-white',
                    isSkipped && 'bg-gray-300 text-gray-500',
                    isUpcoming && 'bg-gray-200 text-gray-500'
                  )}
                >
                  {isCompleted && !isSkipped ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs mt-1 text-center max-w-[60px] truncate',
                    isCurrent && 'text-primary font-medium',
                    isCompleted && 'text-success',
                    isSkipped && 'text-gray-400 line-through',
                    isUpcoming && 'text-gray-400'
                  )}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2',
                    step.id < currentStep || skippedSteps.includes(step.id)
                      ? 'bg-success'
                      : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
