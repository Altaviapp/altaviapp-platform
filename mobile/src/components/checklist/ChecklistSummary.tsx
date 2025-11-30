'use client';

import { CheckCircle2, ArrowRight } from 'lucide-react';
import type { ChecklistData } from '@/types';
import { cn } from '@/lib/utils';

interface ChecklistSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  checklistData: ChecklistData;
}

/**
 * Modal de confirmación exitosa del checklist
 *
 * Se muestra cuando todos los ítems están completados sin problemas
 */
export function ChecklistSummary({ isOpen, onClose, onContinue, checklistData }: ChecklistSummaryProps) {
  if (!isOpen) return null;

  const handleContinue = () => {
    onClose();
    onContinue();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-6">
          {/* Icon de éxito */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
          </div>

          {/* Título */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              ¡Checklist Completado!
            </h2>
            <p className="text-gray-600">
              Todos los ítems han sido verificados exitosamente
            </p>
          </div>

          {/* Resumen */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ítems verificados:</span>
              <span className="font-semibold text-gray-900">17/17</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Estado:</span>
              <span className="font-semibold text-success">✓ Sin problemas</span>
            </div>
            {checklistData.observations && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">Observaciones:</p>
                <p className="text-sm text-gray-700 mt-1">{checklistData.observations}</p>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Revisar
            </button>
            <button
              onClick={handleContinue}
              className="flex-1 px-4 py-3 bg-accent hover:bg-accent/90 text-primary rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              Continuar al Viaje
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
