import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistProgressProps {
  completed: number;
  total: number;
  className?: string;
}

/**
 * Componente de barra de progreso del checklist
 *
 * Muestra visualmente cuántos ítems han sido completados del total
 * Cambia de color según el porcentaje de completitud
 */
export function ChecklistProgress({ completed, total, className }: ChecklistProgressProps) {
  const percentage = Math.round((completed / total) * 100);

  // Determinar color según progreso
  const getProgressColor = () => {
    if (percentage === 100) return 'bg-success';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-gray-400';
  };

  const getTextColor = () => {
    if (percentage === 100) return 'text-success';
    if (percentage >= 50) return 'text-warning';
    return 'text-gray-600';
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header con contador */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className={cn('w-5 h-5', getTextColor())} />
          <span className="text-sm font-medium text-gray-700">
            Progreso del Checklist
          </span>
        </div>
        <span className={cn('text-sm font-semibold', getTextColor())}>
          {completed}/{total} completados
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'absolute left-0 top-0 h-full transition-all duration-300 ease-out',
            getProgressColor()
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Porcentaje */}
      <div className="text-center">
        <span className={cn('text-2xl font-bold', getTextColor())}>
          {percentage}%
        </span>
        {percentage === 100 && (
          <p className="text-xs text-success mt-1">
            ¡Todos los ítems completados!
          </p>
        )}
      </div>
    </div>
  );
}
