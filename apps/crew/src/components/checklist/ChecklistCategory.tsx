'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, type LucideIcon } from 'lucide-react';
import type { ChecklistItem as ChecklistItemType } from '@/types';
import { ChecklistItem } from './ChecklistItem';
import { cn } from '@/lib/utils';

interface ChecklistCategoryProps {
  title: string;
  icon: LucideIcon;
  items: ChecklistItemType[];
  onToggleItem: (itemId: string) => void;
  onMarkIssue: (itemId: string, hasIssue: boolean, description?: string) => void;
  defaultOpen?: boolean;
  className?: string;
}

/**
 * Componente de categoría del checklist
 *
 * Agrupa múltiples ítems bajo una categoría colapsable
 * Muestra progreso de la categoría (X/Y completados)
 */
export function ChecklistCategory({
  title,
  icon: Icon,
  items,
  onToggleItem,
  onMarkIssue,
  defaultOpen = false,
  className
}: ChecklistCategoryProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const completedCount = items.filter(item => item.checked).length;
  const totalCount = items.length;
  const isComplete = completedCount === totalCount;

  return (
    <div className={cn('border border-gray-200 rounded-lg overflow-hidden bg-white', className)}>
      {/* Header - Clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            isComplete ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className={cn(
              'text-sm',
              isComplete ? 'text-success font-medium' : 'text-gray-500'
            )}>
              {completedCount}/{totalCount} completados
            </p>
          </div>
        </div>

        {/* Toggle icon */}
        <div className="flex-shrink-0">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Items - Collapsible */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
          <div className="pt-3 space-y-4">
            {items.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                onToggle={() => onToggleItem(item.id)}
                onMarkIssue={(hasIssue, description) => onMarkIssue(item.id, hasIssue, description)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
