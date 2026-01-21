'use client';

/**
 * WizardStepIndicator Component
 *
 * Shows progress through the 6-step bulk route creation wizard.
 * Displays current step, completed steps, and allows navigation to previous steps.
 */

import { CheckCircle, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

interface WizardStepIndicatorProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
}

export function WizardStepIndicator({
  steps,
  currentStep,
  onStepClick,
}: WizardStepIndicatorProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between overflow-x-auto">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center flex-shrink-0">
              {/* Step Circle */}
              <button
                onClick={() => {
                  // Allow going back to completed steps
                  if (step.id < currentStep && onStepClick) {
                    onStepClick(step.id);
                  }
                }}
                disabled={step.id > currentStep}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg transition-colors',
                  step.id < currentStep && 'cursor-pointer hover:bg-gray-50',
                  step.id > currentStep && 'cursor-not-allowed opacity-50'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0',
                    isCompleted && 'bg-success text-white',
                    isActive && 'bg-primary text-white',
                    !isActive && !isCompleted && 'bg-gray-100 text-gray-400'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <p
                    className={cn(
                      'font-medium text-sm whitespace-nowrap',
                      isActive ? 'text-primary' : 'text-gray-600'
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    {step.description}
                  </p>
                </div>
              </button>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-4 md:w-8 lg:w-12 h-0.5 mx-1 flex-shrink-0',
                    currentStep > step.id ? 'bg-success' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile step title */}
      <div className="lg:hidden mt-4 text-center border-t border-gray-100 pt-4">
        <p className="font-medium text-primary">
          Paso {currentStep}: {steps[currentStep - 1]?.title}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {steps[currentStep - 1]?.description}
        </p>
      </div>
    </div>
  );
}
