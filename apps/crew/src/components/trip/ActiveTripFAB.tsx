'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActiveConvexTrip } from '@/hooks';

/**
 * Floating Action Button that appears when there's an active trip
 * Shows bus icon + next stop name
 * Hidden on the active trip page itself
 */
export function ActiveTripFAB() {
  const pathname = usePathname();
  const { activeTrip, hasActiveTrip, isLoading } = useActiveConvexTrip();

  // Don't show on active trip page or while loading
  const isOnActiveTripPage = pathname?.includes('/active');

  if (isLoading || !hasActiveTrip || isOnActiveTripPage || !activeTrip) {
    return null;
  }

  // Get next stop name from trip data if available
  // For now, we'll show the route name as a fallback
  const nextStopName = activeTrip.route?.name || 'Viaje activo';

  return (
    <Link
      href={`/trips/${activeTrip._id}/active`}
      className={cn(
        'fixed z-40 flex items-center gap-2',
        'bg-primary text-white px-4 py-3 rounded-full shadow-lg',
        'hover:bg-primary/90 transition-all',
        'animate-pulse hover:animate-none',
        // Position: bottom right, above mobile nav on mobile
        'bottom-24 right-4 lg:bottom-8'
      )}
    >
      <Bus className="w-5 h-5 flex-shrink-0" />
      <ArrowRight className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm font-medium truncate max-w-32">
        {nextStopName}
      </span>
    </Link>
  );
}
