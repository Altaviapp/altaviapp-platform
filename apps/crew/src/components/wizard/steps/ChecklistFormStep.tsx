'use client';

import { useState } from 'react';
import { Wrench, Lightbulb, Shield, Sparkles, ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChecklistState } from '@/hooks';
import {
  ChecklistProgress,
  ChecklistCategory,
  ChecklistPhotoUpload,
  ChecklistSummary,
  ChecklistProblemDialog,
} from '@/components/checklist';
import type { ChecklistData } from '@/types';

interface ChecklistFormStepProps {
  onComplete: (checklistData: ChecklistData) => void;
  onBack: () => void;
  onSkip: () => void;
}

export function ChecklistFormStep({ onComplete, onBack, onSkip }: ChecklistFormStepProps) {
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

  const handleComplete = () => {
    if (hasIssues) {
      setShowProblemDialog(true);
    } else {
      setShowSummary(true);
    }
  };

  const handleContinue = () => {
    const data = submitChecklist();
    onComplete(data);
  };

  const handleCancelTrip = () => {
    // Close dialog and go back - user decided not to continue
    setShowProblemDialog(false);
    onBack();
  };

  const handlePhotoUpload = async (file: File) => {
    await uploadPhoto(file);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)]">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-gray-900">
            Inspección del Vehículo
          </h2>
          <p className="text-sm text-gray-600">
            Verifica el estado del vehículo antes de iniciar
          </p>
        </div>

        {/* Progress */}
        <ChecklistProgress completed={completedItems} total={totalItems} />

        {/* Categories */}
        <div className="space-y-3">
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
            placeholder="Agrega cualquier observación adicional..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            rows={2}
          />
        </div>

        {/* Photo Upload */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <ChecklistPhotoUpload onUpload={handlePhotoUpload} />
        </div>
      </div>

      {/* Fixed bottom actions */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-3 safe-area-pb">
        {/* Skip option */}
        <button
          onClick={onSkip}
          className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Saltar inspección y continuar
        </button>

        {/* Main actions */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          <button
            onClick={handleComplete}
            disabled={!isComplete}
            className={cn(
              'flex-[2] py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors',
              isComplete
                ? 'bg-success text-white hover:bg-success/90'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            {isComplete ? 'Completar' : `${completedItems}/${totalItems}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
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
