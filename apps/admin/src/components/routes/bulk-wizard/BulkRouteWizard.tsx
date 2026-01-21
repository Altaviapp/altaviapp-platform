'use client';

/**
 * BulkRouteWizard Component
 *
 * 6-step wizard for bulk route creation during institution onboarding:
 * 1. Basic Info - Route type, schedule, fleet summary
 * 2. Student Selection - Select students with map visualization
 * 3. Vehicle Calculation - Select vehicles and calculate routes
 * 4. Review Routes - Review and edit generated routes
 * 5. Crew Assignment - Assign drivers and monitors
 * 6. Confirmation - Final review and save
 *
 * Uses Google Maps optimization for route calculation.
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Users,
  Bus,
  MapPin,
  UserCheck,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WizardStepIndicator, type WizardStep } from './WizardStepIndicator';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2StudentSelection } from './Step2StudentSelection';
import { Step3VehicleCalculation } from './Step3VehicleCalculation';
import { Step4RouteReview } from './Step4RouteReview';

// Step definitions
const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    title: 'Configuración',
    description: 'Tipo y horario',
    icon: Settings,
  },
  {
    id: 2,
    title: 'Estudiantes',
    description: 'Selección',
    icon: Users,
  },
  {
    id: 3,
    title: 'Vehículos',
    description: 'Cálculo',
    icon: Bus,
  },
  {
    id: 4,
    title: 'Rutas',
    description: 'Revisión',
    icon: MapPin,
  },
  {
    id: 5,
    title: 'Tripulación',
    description: 'Asignación',
    icon: UserCheck,
  },
  {
    id: 6,
    title: 'Confirmación',
    description: 'Crear rutas',
    icon: CheckCircle,
  },
];

// Wizard state types (will be expanded in later user stories)
export interface BulkWizardStep1Data {
  routeType: 'pickup' | 'dropoff' | '';
  targetTime: string;
  operationType: 'daily' | 'specific';
  selectedDays: string[];
}

export interface BulkWizardStep2Filters {
  search?: string;
  grade?: string;
  parentName?: string;
  hasGps?: boolean;
}

export interface BulkWizardStep2Data {
  selectedStudentIds: string[];
  filters: BulkWizardStep2Filters;
}

export interface BulkWizardStep3Data {
  selectedVehicleIds: string[];
  groupingRadius: number;
  maxRouteTime: number;
  optimizationPriority: 'less_stops' | 'less_distance';
}

export interface GeneratedRoute {
  id: string;
  name: string;
  vehicleId: string;
  stops: Array<{
    id: string;
    latitude: number;
    longitude: number;
    studentIds: string[];
    order: number;
  }>;
  polyline: string;
  duration: number;
  distance: number;
}

export interface BulkWizardStep4Data {
  generatedRoutes: GeneratedRoute[];
  unassignedStudentIds: string[];
}

export interface BulkWizardStep5Data {
  routeAssignments: Array<{
    routeId: string;
    driverId: string;
    monitorId?: string;
  }>;
}

export interface BulkWizardStep6Data {
  confirmed: boolean;
}

export interface BulkWizardState {
  step1: BulkWizardStep1Data;
  step2: BulkWizardStep2Data;
  step3: BulkWizardStep3Data;
  step4: BulkWizardStep4Data;
  step5: BulkWizardStep5Data;
  step6: BulkWizardStep6Data;
}

// Initial state
const initialState: BulkWizardState = {
  step1: {
    routeType: '',
    targetTime: '',
    operationType: 'daily',
    selectedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  },
  step2: {
    selectedStudentIds: [],
    filters: {
      hasGps: true, // Default: only show students with GPS
    },
  },
  step3: {
    selectedVehicleIds: [],
    groupingRadius: 100,
    maxRouteTime: 60,
    optimizationPriority: 'less_stops',
  },
  step4: {
    generatedRoutes: [],
    unassignedStudentIds: [],
  },
  step5: {
    routeAssignments: [],
  },
  step6: {
    confirmed: false,
  },
};

export function BulkRouteWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wizardState, setWizardState] = useState<BulkWizardState>(initialState);

  // Step validity state
  const [stepValidity, setStepValidity] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  });

  // Update a single step's data
  const updateStepData = useCallback(
    <K extends keyof BulkWizardState>(
      stepKey: K,
      data: Partial<BulkWizardState[K]>
    ) => {
      setWizardState((prev) => ({
        ...prev,
        [stepKey]: { ...prev[stepKey], ...data },
      }));
    },
    []
  );

  // Update step validity
  const setStepValid = useCallback((step: number, valid: boolean) => {
    setStepValidity((prev) => ({ ...prev, [step]: valid }));
  }, []);

  // Navigation
  const canGoNext = () => stepValidity[currentStep];

  const handleNext = () => {
    if (currentStep < 6 && canGoNext()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep) {
      setCurrentStep(stepId);
    }
  };

  const handleCancel = () => {
    router.push('/routes');
  };

  const handleSave = async () => {
    // Will be implemented in US-027
    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Call createBulkRoutes mutation
      console.log('Saving bulk routes:', wizardState);
      router.push('/routes');
    } catch (err) {
      console.error('Error creating bulk routes:', err);
      setError(
        err instanceof Error ? err.message : 'Error al crear las rutas'
      );
      setIsSubmitting(false);
    }
  };

  // Render step content based on current step
  const renderStepContent = () => {
    const stepTitles: Record<number, { title: string; description: string }> = {
      1: {
        title: 'Configuración Básica',
        description:
          'Define el tipo de ruta, horario objetivo y días de operación.',
      },
      2: {
        title: 'Selección de Estudiantes',
        description:
          'Selecciona los estudiantes que serán asignados a las nuevas rutas.',
      },
      3: {
        title: 'Cálculo de Vehículos',
        description:
          'Selecciona los vehículos disponibles y configura los parámetros de cálculo.',
      },
      4: {
        title: 'Revisión de Rutas',
        description:
          'Revisa las rutas generadas y realiza ajustes si es necesario.',
      },
      5: {
        title: 'Asignación de Tripulación',
        description: 'Asigna conductores y monitores a cada ruta.',
      },
      6: {
        title: 'Confirmación Final',
        description: 'Revisa el resumen y confirma la creación de las rutas.',
      },
    };

    const currentStepInfo = stepTitles[currentStep as keyof typeof stepTitles];
    const currentWizardStep = WIZARD_STEPS[currentStep - 1];

    if (!currentStepInfo || !currentWizardStep) {
      return null;
    }

    const { title, description } = currentStepInfo;

    // Render the appropriate step component
    const renderStepComponent = () => {
      switch (currentStep) {
        case 1:
          return (
            <Step1BasicInfo
              data={wizardState.step1}
              onChange={(data) => updateStepData('step1', data)}
              onValidChange={(valid) => setStepValid(1, valid)}
            />
          );
        case 2:
          return (
            <Step2StudentSelection
              step1Data={wizardState.step1}
              data={wizardState.step2}
              onChange={(data) => updateStepData('step2', data)}
              onValidChange={(valid) => setStepValid(2, valid)}
              onConfirm={() => setCurrentStep(3)}
            />
          );
        case 3:
          return (
            <Step3VehicleCalculation
              step1Data={wizardState.step1}
              selectedStudentIds={wizardState.step2.selectedStudentIds}
              data={wizardState.step3}
              onChange={(data) => updateStepData('step3', data)}
              onValidChange={(valid) => setStepValid(3, valid)}
              onCalculationComplete={(routes, unassignedIds) => {
                updateStepData('step4', {
                  generatedRoutes: routes,
                  unassignedStudentIds: unassignedIds,
                });
              }}
              onAdvanceToStep4={() => setCurrentStep(4)}
            />
          );
        case 4:
          return (
            <Step4RouteReview
              data={wizardState.step4}
              onChange={(data) => updateStepData('step4', data)}
              onValidChange={(valid) => setStepValid(4, valid)}
            />
          );
        // Steps 5-6 will be added in future user stories
        default:
          return (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="text-center">
                <p className="text-gray-500">
                  Contenido del Paso {currentStep} (por implementar)
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {currentWizardStep.title}
                </p>
              </div>
            </div>
          );
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-500 text-sm mt-1">{description}</p>
        </div>

        {renderStepComponent()}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <WizardStepIndicator
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-xl p-4">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {renderStepContent()}
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
          Atrás
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2.5 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            Cancelar
          </button>

          {currentStep < 6 ? (
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
                  Creando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Crear Rutas
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
