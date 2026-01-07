'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useRouteWithStudents,
  useNovedadesForRoute,
  useTripOperations,
  useConvexAuth,
  useNovedadesConfirmation,
} from '@/hooks';
import { LoadingState } from '@/components/core';
import { WizardProgress } from './WizardProgress';
import { TripStartOverviewStep } from './steps/TripStartOverviewStep';
import { NovedadesReviewStep } from './steps/NovedadesReviewStep';
import { ChecklistFormStep } from './steps/ChecklistFormStep';
import { ConfirmationStep } from './steps/ConfirmationStep';
import { StudentListSheet } from '@/components/sheets/StudentListSheet';
import type { ChecklistData } from '@/types';
import type { Id } from '../../../../../convex/_generated/dataModel';

interface TripStartWizardProps {
  routeId: string;
}

type WizardStep = 'overview' | 'novedades' | 'checklist' | 'confirmation';

export function TripStartWizard({ routeId }: TripStartWizardProps) {
  const router = useRouter();
  const { isDriver } = useConvexAuth();

  // Data hooks
  const { route, isLoading: routeLoading } = useRouteWithStudents(routeId);
  const { novedades, summary, isLoading: novedadesLoading } = useNovedadesForRoute(routeId);
  const { startTripFromRoute } = useTripOperations();

  // Novedades confirmation state
  const {
    confirmedIds,
    confirmedAt,
    isConfirming,
    allConfirmed,
    confirmSingle,
    confirmAll,
    submitConfirmations,
    confirmedNovedadIds,
  } = useNovedadesConfirmation(novedades);

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('overview');
  const [checklistData, setChecklistData] = useState<ChecklistData | null>(null);
  const [showStudentSheet, setShowStudentSheet] = useState(false);

  // GPS state
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate which steps are active based on conditions
  const hasNovedades = summary.total > 0;

  // Build wizard steps dynamically
  const getWizardSteps = () => {
    const steps = [
      { id: 'overview', title: 'Inicio' },
    ];

    if (hasNovedades) {
      steps.push({ id: 'novedades', title: 'Novedades' });
    }

    if (isDriver) {
      steps.push({ id: 'checklist', title: 'Inspección', isOptional: true } as any);
    }

    steps.push({ id: 'confirmation', title: 'Confirmar' });

    return steps;
  };

  const wizardSteps = getWizardSteps();

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

  // Navigation handlers
  const handleOverviewNext = useCallback(() => {
    if (hasNovedades) {
      setCurrentStep('novedades');
    } else if (isDriver) {
      setCurrentStep('checklist');
    } else {
      setCurrentStep('confirmation');
    }
  }, [hasNovedades, isDriver]);

  const handleNovedadesNext = useCallback(async () => {
    // Submit confirmations to backend
    await submitConfirmations();

    if (isDriver) {
      setCurrentStep('checklist');
    } else {
      setCurrentStep('confirmation');
    }
  }, [isDriver, submitConfirmations]);

  const handleNovedadesBack = useCallback(() => {
    setCurrentStep('overview');
  }, []);

  const handleChecklistComplete = useCallback((data: ChecklistData) => {
    setChecklistData(data);
    setCurrentStep('confirmation');
  }, []);

  const handleChecklistSkip = useCallback(() => {
    setChecklistData(null);
    setCurrentStep('confirmation');
  }, []);

  const handleChecklistBack = useCallback(() => {
    if (hasNovedades) {
      setCurrentStep('novedades');
    } else {
      setCurrentStep('overview');
    }
  }, [hasNovedades]);

  const handleConfirmationBack = useCallback(() => {
    if (isDriver) {
      setCurrentStep('checklist');
    } else if (hasNovedades) {
      setCurrentStep('novedades');
    } else {
      setCurrentStep('overview');
    }
  }, [isDriver, hasNovedades]);

  // Start the trip
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
        checklistPayload,
        confirmedAt || undefined,
        confirmedNovedadIds.length > 0 ? confirmedNovedadIds as Id<"novedades">[] : undefined
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
  }, [routeId, location, startTripFromRoute, checklistData, confirmedAt, confirmedNovedadIds, router]);

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

  // Get current step index for progress
  const currentStepIndex = wizardSteps.findIndex(s => s.id === currentStep);

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
        steps={wizardSteps.map((s, i) => ({ id: i + 1, title: s.title, isOptional: (s as any).isOptional }))}
        currentStep={currentStepIndex + 1}
        skippedSteps={[]}
      />

      {/* Step content */}
      <div className="pb-safe">
        {currentStep === 'overview' && (
          <TripStartOverviewStep
            route={route}
            summary={summary}
            novedadesLoading={novedadesLoading}
            gpsReady={!!location}
            onNext={handleOverviewNext}
            onViewStudents={() => setShowStudentSheet(true)}
          />
        )}

        {currentStep === 'novedades' && (
          <NovedadesReviewStep
            novedades={novedades}
            summary={summary}
            confirmedIds={confirmedIds}
            isConfirming={isConfirming}
            onConfirmSingle={confirmSingle}
            onConfirmAll={confirmAll}
            onNext={handleNovedadesNext}
            onBack={handleNovedadesBack}
          />
        )}

        {currentStep === 'checklist' && (
          <ChecklistFormStep
            onComplete={handleChecklistComplete}
            onBack={handleChecklistBack}
            onSkip={handleChecklistSkip}
          />
        )}

        {currentStep === 'confirmation' && (
          <ConfirmationStep
            routeName={route.name}
            routeType={route.type}
            vehiclePlate={route.vehicle?.licensePlate}
            expectedStudents={expectedStudents}
            totalNovedades={summary.total}
            novedadesConfirmed={allConfirmed || summary.total === 0}
            checklistCompleted={!!checklistData}
            checklistData={checklistData}
            isSubmitting={isSubmitting}
            error={error}
            onConfirm={handleStartTrip}
            onBack={handleConfirmationBack}
          />
        )}
      </div>

      {/* Student List Sheet */}
      <StudentListSheet
        isOpen={showStudentSheet}
        onClose={() => setShowStudentSheet(false)}
        students={route.students || []}
        novedades={novedades}
      />
    </div>
  );
}
