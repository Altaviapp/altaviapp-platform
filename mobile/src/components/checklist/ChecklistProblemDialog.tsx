'use client';

import { AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import type { ChecklistItem } from '@/types';
import { cn } from '@/lib/utils';

interface ChecklistProblemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;      // Cancelar viaje
  onContinue: () => void;    // Continuar con precaución
  issues: ChecklistItem[];   // Items con problemas
}

/**
 * Dialog de manejo de problemas en el checklist
 *
 * Se muestra cuando hay ítems marcados como problemáticos
 * Ofrece dos opciones: Cancelar viaje o Continuar con precaución
 */
export function ChecklistProblemDialog({
  isOpen,
  onClose,
  onCancel,
  onContinue,
  issues
}: ChecklistProblemDialogProps) {
  if (!isOpen) return null;

  const handleCancel = () => {
    onClose();
    onCancel();
  };

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
          {/* Icon de advertencia */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-warning" />
            </div>
          </div>

          {/* Título */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Problemas Detectados
            </h2>
            <p className="text-gray-600">
              Se encontraron {issues.length} {issues.length === 1 ? 'problema' : 'problemas'} durante la inspección
            </p>
          </div>

          {/* Lista de problemas */}
          <div className="bg-warning/5 border border-warning/20 rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto">
            {issues.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    {item.issueDescription && (
                      <p className="text-xs text-gray-600 mt-1">{item.issueDescription}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Información */}
          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <p className="font-medium text-gray-700 mb-1">¿Qué deseas hacer?</p>
            <ul className="space-y-1 text-xs">
              <li>• <strong>Cancelar viaje:</strong> Se creará un reporte de incidente y el viaje será cancelado</li>
              <li>• <strong>Continuar con precaución:</strong> El viaje se marcará con advertencia pero podrás continuar</li>
            </ul>
          </div>

          {/* Botones */}
          <div className="space-y-3">
            {/* Cancelar viaje (destructivo) */}
            <button
              onClick={handleCancel}
              className="w-full px-4 py-3 bg-error hover:bg-error/90 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reportar Problema y Cancelar Viaje
            </button>

            {/* Continuar con precaución */}
            <button
              onClick={handleContinue}
              className="w-full px-4 py-3 bg-warning hover:bg-warning/90 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              Problema Menor - Continuar con Precaución
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Volver */}
            <button
              onClick={onClose}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Volver al Checklist
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
