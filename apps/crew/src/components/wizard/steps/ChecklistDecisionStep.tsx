'use client';

import { ClipboardCheck, Play, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistDecisionStepProps {
  onDecision: (doChecklist: boolean) => void;
  isLoading?: boolean;
}

export function ChecklistDecisionStep({ onDecision, isLoading }: ChecklistDecisionStepProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <ClipboardCheck className="w-10 h-10 text-primary" />
      </div>

      <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
        Inspección del Vehículo
      </h2>

      <p className="text-gray-600 text-center mb-8 max-w-sm">
        ¿Deseas realizar la inspección del vehículo antes de iniciar el viaje?
      </p>

      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => onDecision(true)}
          disabled={isLoading}
          className={cn(
            'w-full py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-3',
            'bg-primary text-white hover:bg-primary/90 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <ClipboardCheck className="w-5 h-5" />
          Sí, hacer inspección
          <ArrowRight className="w-5 h-5 ml-auto" />
        </button>

        <button
          onClick={() => onDecision(false)}
          disabled={isLoading}
          className={cn(
            'w-full py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-3',
            'bg-success text-white hover:bg-success/90 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Play className="w-5 h-5" />
          No, continuar sin inspección
          <ArrowRight className="w-5 h-5 ml-auto" />
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-6 max-w-xs">
        La inspección es opcional pero recomendada para garantizar la seguridad del viaje
      </p>
    </div>
  );
}
