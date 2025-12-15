import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
  onCancel: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  variant?: 'default' | 'danger';
  className?: string;
}

/**
 * FormActions Component
 *
 * Standard form action buttons: Cancel and Submit.
 * Based on ADMIN_WIREFRAMES.md button patterns.
 */
export function FormActions({
  onCancel,
  onSubmit,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  isDisabled = false,
  variant = 'default',
  className,
}: FormActionsProps) {
  const submitClasses = cn(
    'px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2',
    variant === 'default'
      ? 'bg-primary text-white hover:bg-primary/90'
      : 'bg-red-600 text-white hover:bg-red-700',
    (isLoading || isDisabled) && 'opacity-60 cursor-not-allowed'
  );

  return (
    <div className={cn('flex items-center justify-end gap-3 pt-4', className)}>
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="px-4 py-2 rounded-lg font-medium text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
      >
        {cancelLabel}
      </button>
      <button
        type={onSubmit ? 'button' : 'submit'}
        onClick={onSubmit}
        disabled={isLoading || isDisabled}
        className={submitClasses}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {submitLabel}
      </button>
    </div>
  );
}
