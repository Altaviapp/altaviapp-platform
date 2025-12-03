'use client';

import { useState } from 'react';
import { Check, AlertTriangle, X } from 'lucide-react';
import type { ChecklistItem as ChecklistItemType } from '@/types';
import { cn } from '@/lib/utils';

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle: () => void;
  onMarkIssue: (hasIssue: boolean, description?: string) => void;
  className?: string;
}

/**
 * Componente de ítem individual del checklist
 *
 * Características:
 * - Checkbox grande y táctil (min 48x48px)
 * - Permite marcar como problemático
 * - Textarea para descripción del problema
 * - Estados visuales claros
 */
export function ChecklistItem({ item, onToggle, onMarkIssue, className }: ChecklistItemProps) {
  const [showIssueForm, setShowIssueForm] = useState(!!item.hasIssue);
  const [issueDescription, setIssueDescription] = useState(item.issueDescription || '');

  const handleToggleIssue = () => {
    const newShowIssue = !showIssueForm;
    setShowIssueForm(newShowIssue);

    if (!newShowIssue) {
      // Cancelar problema
      setIssueDescription('');
      onMarkIssue(false);
    }
  };

  const handleSaveIssue = () => {
    if (issueDescription.trim()) {
      onMarkIssue(true, issueDescription.trim());
    }
  };

  const handleCancelIssue = () => {
    setShowIssueForm(false);
    setIssueDescription('');
    onMarkIssue(false);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Item principal */}
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all',
            'min-w-[48px] min-h-[48px]', // Touch target
            item.checked
              ? 'bg-success border-success text-white'
              : 'bg-white border-gray-300 hover:border-gray-400'
          )}
          aria-label={`${item.checked ? 'Desmarcar' : 'Marcar'} ${item.label}`}
        >
          {item.checked && <Check className="w-6 h-6" />}
        </button>

        {/* Label y botón de problema */}
        <div className="flex-1 min-w-0 pt-2">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                'text-base font-medium',
                item.checked ? 'text-gray-900' : 'text-gray-600'
              )}
            >
              {item.label}
            </span>

            {item.checked && (
              <button
                onClick={handleToggleIssue}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
                  showIssueForm
                    ? 'bg-error/10 text-error border border-error'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {showIssueForm ? (
                  <>
                    <X className="w-3 h-3" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    Problema
                  </>
                )}
              </button>
            )}
          </div>

          {/* Badge de advertencia si hay problema guardado */}
          {item.hasIssue && !showIssueForm && (
            <div className="mt-1 flex items-start gap-1 text-xs text-error">
              <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>{item.issueDescription}</span>
            </div>
          )}
        </div>
      </div>

      {/* Formulario de problema */}
      {showIssueForm && (
        <div className="ml-15 pl-3 border-l-2 border-error/30 space-y-2">
          <label htmlFor={`issue-${item.id}`} className="block text-sm font-medium text-gray-700">
            Descripción del problema
          </label>
          <textarea
            id={`issue-${item.id}`}
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            placeholder="Describe el problema encontrado..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-error focus:border-error resize-none"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveIssue}
              disabled={!issueDescription.trim()}
              className={cn(
                'px-3 py-1.5 rounded text-sm font-medium transition-colors',
                issueDescription.trim()
                  ? 'bg-error text-white hover:bg-error/90'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
            >
              Guardar Problema
            </button>
            <button
              onClick={handleCancelIssue}
              className="px-3 py-1.5 rounded text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
