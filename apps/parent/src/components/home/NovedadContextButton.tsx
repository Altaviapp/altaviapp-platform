'use client';

import Link from 'next/link';
import { AlertTriangle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Id } from '../../../../../convex/_generated/dataModel';

interface NovedadContextButtonProps {
  studentId: Id<"students">;
  tripId?: Id<"trips">;
  date?: string; // YYYY-MM-DD for future trips
  routeType?: 'pickup' | 'dropoff';
  variant?: 'small' | 'full' | 'icon';
  label?: string;
  className?: string;
}

export function NovedadContextButton({
  studentId,
  tripId,
  date,
  routeType,
  variant = 'small',
  label,
  className,
}: NovedadContextButtonProps) {
  // Build URL with context params
  const params = new URLSearchParams();
  params.set('studentId', studentId);
  if (tripId) params.set('tripId', tripId);
  if (date) params.set('date', date);
  if (routeType) params.set('routeType', routeType);

  const href = `/novedades/create?${params.toString()}`;

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
