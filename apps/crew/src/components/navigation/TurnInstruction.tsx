'use client';

import { cn } from '@/lib/utils';
import { ManeuverIcon, maneuverTranslations } from './ManeuverIcon';

export interface NavigationStep {
  instruction: string;
  maneuver: string;
  distance: number; // meters
  duration: number; // seconds
  streetName?: string;
}

interface TurnInstructionProps {
  step: NavigationStep;
  distanceRemaining?: number; // meters to maneuver
  variant?: 'current' | 'next';
  className?: string;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  // Round to nearest 10m for cleaner display
  const rounded = Math.round(meters / 10) * 10;
  return `${rounded} m`;
}

export function TurnInstruction({
  step,
  distanceRemaining,
  variant = 'current',
  className,
}: TurnInstructionProps) {
  const isCurrent = variant === 'current';

  // Use translation if available, otherwise use the instruction from API
  const displayInstruction = step.instruction || maneuverTranslations[step.maneuver] || 'Continúa';

  // Distance to show - use remaining distance if provided, otherwise step distance
  const displayDistance = distanceRemaining ?? step.distance;

  return (
    <div className={cn(
      'flex items-center gap-3',
      isCurrent ? 'p-3' : 'px-3 py-2',
      className
    )}>
      <ManeuverIcon
        maneuver={step.maneuver}
        size={isCurrent ? 'lg' : 'sm'}
        className={cn(
          isCurrent ? 'bg-primary' : 'bg-gray-400'
        )}
      />

      <div className="flex-1 min-w-0">
        {isCurrent ? (
          <>
            <p className="font-bold text-gray-900 text-lg leading-tight">
              {displayInstruction}
            </p>
            {step.streetName && (
              <p className="text-gray-600 text-sm truncate">
                en {step.streetName}
              </p>
            )}
          </>
        ) : (
          <p className="text-gray-600 text-sm truncate">
            {displayInstruction}
            {step.streetName && ` en ${step.streetName}`}
          </p>
        )}
      </div>

      <div className={cn(
        'text-right flex-shrink-0',
        isCurrent ? 'min-w-[70px]' : 'min-w-[50px]'
      )}>
        <p className={cn(
          'font-bold',
          isCurrent ? 'text-primary text-xl' : 'text-gray-500 text-sm'
        )}>
          {formatDistance(displayDistance)}
        </p>
      </div>
    </div>
  );
}
