'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouteWithStudents, useNovedadesForRoute, useTripOperations } from '@/hooks';
import { LoadingState } from '@/components/core';
import { WizardProgress } from './WizardProgress';
import { ChecklistDecisionStep } from './steps/ChecklistDecisionStep';
import { ChecklistFormStep } from './steps/ChecklistFormStep';
import { TripPreviewStep } from './steps/TripPreviewStep';
import { ConfirmationStep } from './steps/ConfirmationStep';
import type { ChecklistData } from '@/types';

interface TripStartWizardProps {
  routeId: string;
}

type WizardStep = 1 | 2 | 3 | 4;

const WIZARD_STEPS = [
  { id: 1, title: 'Inspección' },
  { id: 2, title: 'Checklist', isOptional: true },
  { id: 3, title: 'Resumen' },
  { id: 4, title: 'Confirmar' },
];

export function TripStartWizard({ routeId }: TripStartWizardProps) {
  const router = useRouter();

  // Data hooks
  const { route, isLoading: routeLoading } = useRouteWithStudents(routeId);
  const { novedades, summary, isLoading: novedadesLoading } = useNovedadesForRoute(routeId);
  const { startTripFromRoute } = useTripOperations();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [doChecklist, setDoChecklist] = useState<boolean | null>(null);
  const [checklistData, setChecklistData] = useState<ChecklistData | null>(null);
  const [skippedSteps, setSkippedSteps] = useState<number[]>([]);

  // GPS state
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get GPS location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          console.error('Error getting location:', err);
          // Use default location if GPS fails (Guayaquil)
          setLocation({ latitude: -2.1894, longitude: -79.8891 });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocation({ latitude: -2.1894, longitude: -79.8891 });
    }
  }, []);

  // Step 1: Handle checklist decision
  const handleChecklistDecision = useCallback((wantsChecklist: boolean) => {
    setDoChecklist(wantsChecklist);
    if (wantsChecklist) {
      setCurrentStep(2);
    } else {
      // Skip step 2 and go to preview
      setSkippedSteps([2]);
      setCurrentStep(3);
    }
  }, []);

  // Step 2: Handle checklist completion
  const handleChecklistComplete = useCallback((data: ChecklistData) => {
    setChecklistData(data);
    setCurrentStep(3);
  }, []);

  // Step 2: Handle checklist skip (user changed mind)
  const handleChecklistSkip = useCallback(() => {
    setDoChecklist(false);
    setChecklistData(null);
    setSkippedSteps((prev) => [...prev, 2]);
    setCurrentStep(3);
  }, []);

  // Step 2: Go back to decision
  const handleChecklistBack = useCallback(() => {
    setDoChecklist(null);
    setCurrentStep(1);
  }, []);

  // Step 3: Go to confirmation
  const handlePreviewNext = useCallback(() => {
    setCurrentStep(4);
  }, []);

  // Step 3: Go back
  const handlePreviewBack = useCallback(() => {
    if (doChecklist && checklistData) {
      // Go back to checklist if it was completed
      setCurrentStep(2);
    } else {
      // Go back to decision
      setSkippedSteps([]);
      setCurrentStep(1);
    }
  }, [doChecklist, checklistData]);

  // Step 4: Go back to preview
  const handleConfirmationBack = useCallback(() => {
    setCurrentStep(3);
  }, []);

  // Step 4: Start the trip
  const handleStartTrip = useCallback(async () => {
    if (!routeId || !location) {
      setError('No se pudo obtener la ubicación GPS. Por favor, permite el acceso a tu ubicación.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Convert checklistData to backend format if present
      const checklistPayload = checklistData ? {
        completedAt: checklistData.completedAt ? new Date(checklistData.completedAt).getTime() : Date.now(),
        items: [
          ...checklistData.mechanicalItems.map(item => ({ ...item, category: 'mechanical' })),
          ...checklistData.lightsItems.map(item => ({ ...item, category: 'lights' })),
          ...checklistData.safetyItems.map(item => ({ ...item, category: 'safety' })),
          ...checklistData.cleanlinessItems.map(item => ({ ...item, category: 'cleanliness' })),
        ].map(item => ({
          id: item.id,
          label: item.label,
          category: item.category,
          checked: item.checked,
        })),
        notes: checklistData.observations,
        allPassed: !checklistData.hasIssues,
      } : undefined;

      const result = await startTripFromRoute(
        routeId,
        location.latitude,
        location.longitude,
        checklistPayload
      );

      if (result.success && result.tripId) {
        // Navigate to active trip
        router.push(`/trips/${result.tripId}/active`);
      } else {
        setError('Error al iniciar el viaje. Intenta de nuevo.');
      }
    } catch (err) {
      console.error('Error starting trip:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar el viaje');
    } finally {
      setIsSubmitting(false);
    }
  }, [routeId, location, startTripFromRoute, checklistData, router]);

  // Loading state
  if (routeLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-primary text-white px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Iniciar Viaje</h1>
            </div>
          </div>
        </div>
        <LoadingState message="Cargando ruta..." />
      </div>
    );
  }

  // Route not found
  if (!route) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-gray-600 mb-4">Ruta no encontrada</p>
        <Link href="/dashboard" className="text-primary font-medium">
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  // Calculate expected students
  const expectedStudents = (route.students?.length || 0) - summary.absences - summary.parentPickups;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Iniciar Viaje</h1>
              <p className="text-sm text-white/70">{route.name}</p>
            </div>
          </div>
          <Link href="/dashboard" className="p-2 -mr-2 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Progress indicator */}
      <WizardProgress
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        skippedSteps={skippedSteps}
      />

      {/* Step content */}
      <div className="pb-safe">
        {currentStep === 1 && (
          <ChecklistDecisionStep
            onDecision={handleChecklistDecision}
            isLoading={false}
          />
        )}

        {currentStep === 2 && (
          <ChecklistFormStep
            onComplete={handleChecklistComplete}
            onBack={handleChecklistBack}
            onSkip={handleChecklistSkip}
          />
        )}

        {currentStep === 3 && (
          <TripPreviewStep
            route={route}
            novedades={novedades}
            summary={summary}
            novedadesLoading={novedadesLoading}
            gpsReady={!!location}
            onNext={handlePreviewNext}
            onBack={handlePreviewBack}
          />
        )}

        {currentStep === 4 && (
          <ConfirmationStep
            routeName={route.name}
            routeType={route.type}
            vehiclePlate={route.vehicle?.licensePlate}
            expectedStudents={expectedStudents}
            totalNovedades={summary.total}
            checklistCompleted={!!checklistData}
            checklistData={checklistData}
            isSubmitting={isSubmitting}
            error={error}
            onConfirm={handleStartTrip}
            onBack={handleConfirmationBack}
          />
        )}
      </div>
    </div>
  );
}
