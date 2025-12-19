'use client';

/**
 * RouteWizard Component
 *
 * Multi-step wizard for creating optimized routes:
 * 1. Planning - Basic info (type, time, vehicle, driver)
 * 2. Stop Assignment - Select students, calculate route
 * 3. Confirmation - Recurrence, review, save
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, CheckCircle, Loader2,
  Settings, Users, Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { Step1Planning, type Step1Data } from './Step1Planning';
import { Step2StopAssignment, type Step2Data } from './Step2StopAssignment';
import { Step3Confirmation, type Step3Data } from './Step3Confirmation';
import type { RecurrenceConfig } from './RecurrenceSelector';

// Re-export types for external use
export type { Step1Data, Step2Data, Step3Data, RecurrenceConfig };

interface RouteWizardProps {
  onSave: (data: {
    step1: Step1Data;
    step2: Step2Data;
    step3: Step3Data;
  }) => Promise<{ routeId: string }>;
}

const steps = [
  { id: 1, title: 'Planificación', icon: Settings, description: 'Tipo, horario y asignaciones' },
  { id: 2, title: 'Estudiantes', icon: Users, description: 'Seleccionar y optimizar ruta' },
  { id: 3, title: 'Confirmación', icon: Calendar, description: 'Frecuencia y revisión final' },
];

export function RouteWizard({ onSave }: RouteWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step validity
  const [step1Valid, setStep1Valid] = useState(false);
  const [step2Valid, setStep2Valid] = useState(false);
  const [step3Valid, setStep3Valid] = useState(false);

  // Step data
  const [step1Data, setStep1Data] = useState<Step1Data>({
    routeType: '',
    targetTime: '',
    vehicleId: '',
    driverId: '',
    monitorId: '',
    routeName: '',
    useAutoName: true,
  });

  const [step2Data, setStep2Data] = useState<Step2Data>({
    selectedStudentIds: [],
    optimizationResult: null,
    isOptimizing: false,
  });

  const [step3Data, setStep3Data] = useState<Step3Data>({
    recurrence: {
      type: 'daily',
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    },
    isActive: true,
  });

  // Navigation
  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return step1Valid;
      case 2:
        return step2Valid;
      case 3:
        return step3Valid;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    if (!canGoNext()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onSave({
        step1: step1Data,
        step2: step2Data,
        step3: step3Data,
      });

      // Success - redirect to routes page
      router.push('/routes');
    } catch (err) {
      console.error('Error creating route:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la ruta');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center">
                {/* Step Circle */}
                <button
                  onClick={() => {
                    // Allow going back to completed steps
                    if (step.id < currentStep) {
                      setCurrentStep(step.id);
                    }
                  }}
                  disabled={step.id > currentStep}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg transition-colors',
                    step.id < currentStep && 'cursor-pointer hover:bg-gray-50',
                    step.id > currentStep && 'cursor-not-allowed opacity-50'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                      isCompleted && 'bg-success text-white',
                      isActive && 'bg-primary text-white',
                      !isActive && !isCompleted && 'bg-gray-100 text-gray-400'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p
                      className={cn(
                        'font-medium text-sm',
                        isActive ? 'text-primary' : 'text-gray-600'
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400">{step.description}</p>
                  </div>
                </button>

                {/* Connector */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'hidden md:block w-16 lg:w-24 h-0.5 mx-2',
                      currentStep > step.id ? 'bg-success' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-xl p-4">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Step Title */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {steps[currentStep - 1]?.title}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {steps[currentStep - 1]?.description}
          </p>
        </div>

        {/* Step Forms */}
        {currentStep === 1 && (
          <Step1Planning
            data={step1Data}
            onChange={setStep1Data}
            onValidChange={setStep1Valid}
          />
        )}

        {currentStep === 2 && (
          <Step2StopAssignment
            step1Data={step1Data}
            data={step2Data}
            onChange={setStep2Data}
            onValidChange={setStep2Valid}
          />
        )}

        {currentStep === 3 && (
          <Step3Confirmation
            step1Data={step1Data}
            step2Data={step2Data}
            data={step3Data}
            onChange={setStep3Data}
            onValidChange={setStep3Valid}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors',
            currentStep === 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        <div className="flex items-center gap-3">
          <a
            href="/routes"
            className="px-4 py-2.5 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            Cancelar
          </a>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext()}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors',
                canGoNext()
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={!canGoNext() || isSubmitting}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors',
                canGoNext() && !isSubmitting
                  ? 'bg-success text-white hover:bg-success/90'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Crear Ruta
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
