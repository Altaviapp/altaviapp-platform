'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Id } from '../../../../../convex/_generated/dataModel';
import { NovedadModal } from '../novedades';

interface NovedadContextButtonProps {
  studentId: Id<"students">;
  studentName?: string; // Required for modal mode
  tripId?: Id<"trips">;
  date?: string; // YYYY-MM-DD for future trips
  routeType?: 'pickup' | 'dropoff';
  variant?: 'small' | 'full' | 'icon';
  label?: string;
  className?: string;
  // Mode: 'modal' opens inline modal, 'link' navigates to form page
  // Default: 'modal' if studentName + date + routeType are provided, otherwise 'link'
  mode?: 'link' | 'modal';
  onSuccess?: (novedadId: Id<'novedades'>) => void;
}

export function NovedadContextButton({
  studentId,
  studentName,
  tripId,
  date,
  routeType,
  variant = 'small',
  label,
  className,
  mode,
  onSuccess,
}: NovedadContextButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Determine mode: modal if we have all required info, otherwise link
  const effectiveMode = mode ?? (studentName && date && routeType ? 'modal' : 'link');
  const useModal = effectiveMode === 'modal' && studentName && date && routeType;

  // Build URL with context params (for link mode)
  const params = new URLSearchParams();
  params.set('studentId', studentId);
  if (tripId) params.set('tripId', tripId);
  if (date) params.set('date', date);
  if (routeType) params.set('routeType', routeType);

  const href = `/novedades/create?${params.toString()}`;

  // Handle modal success
  const handleModalSuccess = (novedadId: Id<'novedades'>) => {
    onSuccess?.(novedadId);
  };

  // Render modal button
  if (useModal) {
    const buttonContent = (
      <>
        {variant === 'icon' ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className={cn(
              "w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center",
              "hover:bg-warning/20 transition-colors",
              className
            )}
            title="Reportar novedad"
          >
            <AlertTriangle className="w-4 h-4 text-warning" />
          </button>
        ) : variant === 'small' ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
              "text-xs font-medium text-warning bg-warning/10",
              "hover:bg-warning/20 transition-colors",
              className
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{label ?? 'Novedad'}</span>
          </button>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg",
              "text-sm font-medium text-warning bg-warning/10",
              "hover:bg-warning/20 transition-colors",
              className
            )}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{label ?? 'Reportar novedad'}</span>
          </button>
        )}

        <NovedadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
          studentId={studentId}
          studentName={studentName}
          date={date}
          routeType={routeType}
        />
      </>
    );

    return buttonContent;
  }

  // Link mode (original behavior)

  if (variant === 'icon') {
    return (
      <Link
        href={href}
        className={cn(
          "w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center",
          "hover:bg-warning/20 transition-colors",
          className
        )}
        title="Reportar novedad"
      >
        <AlertTriangle className="w-4 h-4 text-warning" />
      </Link>
    );
  }

  if (variant === 'small') {
    return (
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
          "text-xs font-medium text-warning bg-warning/10",
          "hover:bg-warning/20 transition-colors",
          className
        )}
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{label ?? 'Novedad'}</span>
      </Link>
    );
  }

  // Full variant
  return (
    <Link
      href={href}
      className={cn(
        "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg",
        "text-sm font-medium text-warning bg-warning/10",
        "hover:bg-warning/20 transition-colors",
        className
      )}
    >
      <AlertTriangle className="w-4 h-4" />
      <span>{label ?? 'Reportar novedad'}</span>
    </Link>
  );
}
