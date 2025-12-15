'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Wrench, Lightbulb, Shield, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { useChecklistState, useConvexAuth } from '@/hooks';
import {
  ChecklistProgress,
  ChecklistCategory,
  ChecklistPhotoUpload,
  ChecklistSummary,
  ChecklistProblemDialog,
} from '@/components/checklist';

/**
 * Página de Checklist Pre-Viaje
 *
 * Solo accesible para conductores.
 * Los monitores son redirigidos al viaje activo directamente.
 */
export default function ChecklistPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = (params?.id as string) || '';

  // Use real auth with fallback for UI testing
  const { isAuthenticated, isDriver: authIsDriver, isMonitor: authIsMonitor, isLoading: authLoading } = useConvexAuth();
  const isDriver = isAuthenticated ? authIsDriver : true; // Default to driver for UI testing
  const isMonitor = isAuthenticated ? authIsMonitor : false;
  const canAccessChecklist = isDriver; // Only drivers can access checklist

  // Redirect monitors away from checklist - they don't do vehicle inspection
  useEffect(() => {
    if (!authLoading && !canAccessChecklist) {
      // Monitors go directly to active trip view
      router.replace(`/trips/${tripId}/active`);
    }
  }, [authLoading, canAccessChecklist, tripId, router]);

  // Don't render checklist for unauthorized users
  if (authLoading || !canAccessChecklist) {
    return null;
  }

  const {
    checklistData,
    observations,
    totalItems,
    completedItems,
    isComplete,
    hasIssues,
    issueItems,
    toggleItem,
    markItemIssue,
    setObservations,
    uploadPhoto,
    submitChecklist,
  } = useChecklistState();

  const [showSummary, setShowSummary] = useState(false);
  const [showProblemDialog, setShowProblemDialog] = useState(false);

  /**
   * Manejar click en botón "COMPLETAR INSPECCIÓN"
   */
  const handleComplete = () => {
    if (hasIssues) {
      setShowProblemDialog(true);
    } else {
      setShowSummary(true);
    }
  };

  /**
   * Continuar al viaje (sin problemas o con precaución)
   */
  const handleContinue = () => {
    const data = submitChecklist();
    console.log('Checklist completado:', data);

    // Guardar que el checklist fue completado (para mock data)
    localStorage.setItem(`checklist_completed_${tripId}`, 'true');
    localStorage.setItem(`checklist_data_${tripId}`, JSON.stringify(data));

    // TODO: Actualizar trip con checklistData en backend
    // Para esta fase, solo navegamos al siguiente paso
    router.push(`/trips/${tripId}/start`);
  };

  /**
   * Cancelar viaje por problemas graves
   */
  const handleCancelTrip = () => {
    const data = submitChecklist();
    console.log('Viaje cancelado por problemas:', data);

    // TODO: Crear incidente y cancelar viaje en backend
    // Para esta fase, solo navegamos al dashboard
    router.push('/dashboard');
  };

  const handlePhotoUpload = async (file: File) => {
    await uploadPhoto(file);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Checklist Pre-Viaje
        </h1>
        <p className="text-gray-600">
          Verifica el estado del vehículo antes de iniciar el viaje
        </p>
      </div>

      {/* Progress */}
      <ChecklistProgress completed={completedItems} total={totalItems} />

      {/* Categories */}
      <div className="space-y-4">
        <ChecklistCategory
          title="Mecánica"
          icon={Wrench}
          items={checklistData.mechanicalItems}
          onToggleItem={toggleItem}
          onMarkIssue={markItemIssue}
          defaultOpen={true}
        />

        <ChecklistCategory
          title="Luces y Señales"
          icon={Lightbulb}
          items={checklistData.lightsItems}
          onToggleItem={toggleItem}
          onMarkIssue={markItemIssue}
          defaultOpen={false}
        />

        <ChecklistCategory
          title="Seguridad"
          icon={Shield}
          items={checklistData.safetyItems}
          onToggleItem={toggleItem}
          onMarkIssue={markItemIssue}
          defaultOpen={false}
        />

        <ChecklistCategory
          title="Limpieza"
          icon={Sparkles}
          items={checklistData.cleanlinessItems}
          onToggleItem={toggleItem}
          onMarkIssue={markItemIssue}
          defaultOpen={false}
        />
      </div>

      {/* Observations */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones (opcional)
        </label>
        <textarea
          id="observations"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Agrega cualquier observación adicional sobre el estado del vehículo..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none"
          rows={3}
        />
      </div>

      {/* Photo Upload */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <ChecklistPhotoUpload onUpload={handlePhotoUpload} />
      </div>

      {/* Submit Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-4 -mb-6 px-4 py-4 md:static md:border-0 md:mx-0 md:mb-0 md:px-0 md:py-0">
        <button
          onClick={handleComplete}
          disabled={!isComplete}
          className={`w-full py-4 rounded-lg text-base font-bold transition-all ${
            isComplete
              ? 'bg-accent hover:bg-accent/90 text-primary shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isComplete ? 'COMPLETAR INSPECCIÓN' : `COMPLETAR INSPECCIÓN (${completedItems}/${totalItems})`}
        </button>
      </div>

      {/* Modals */}
      <ChecklistSummary
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        onContinue={handleContinue}
        checklistData={checklistData}
      />

      <ChecklistProblemDialog
        isOpen={showProblemDialog}
        onClose={() => setShowProblemDialog(false)}
        onCancel={handleCancelTrip}
        onContinue={handleContinue}
        issues={issueItems}
      />
    </div>
  );
}
