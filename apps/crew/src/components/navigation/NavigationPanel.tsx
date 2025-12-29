'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Navigation2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TurnInstruction, type NavigationStep } from './TurnInstruction';

interface NavigationPanelProps {
  currentStep: NavigationStep | null;
  nextStep: NavigationStep | null;
  distanceToManeuver?: number;
  allSteps?: NavigationStep[];
  isTracking?: boolean;
  className?: string;
}

export function NavigationPanel({
  currentStep,
  nextStep,
  distanceToManeuver,
  allSteps = [],
  isTracking = false,
  className,
}: NavigationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't render if no navigation data
  if (!currentStep && !nextStep) {
    return null;
  }

  return (
    <div className={cn('bg-white border-t border-gray-200 shadow-lg', className)}>
      {/* Current instruction - always visible */}
      {currentStep && (
        <div className="bg-gradient-to-r from-primary to-primary/90 text-white">
          <div className="flex items-center gap-3 p-3">
            {/* Maneuver icon */}
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Navigation2
                className="w-8 h-8 text-white"
                style={{
                  transform: getRotationForManeuver(currentStep.maneuver),
                }}
              />
            </div>

            {/* Instruction text */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg leading-tight">
                {currentStep.instruction || getManeuverText(currentStep.maneuver)}
              </p>
              {currentStep.streetName && (
                <p className="text-white/80 text-sm truncate">
                  en {currentStep.streetName}
                </p>
              )}
            </div>

            {/* Distance */}
            <div className="text-right flex-shrink-0 min-w-[80px]">
              <p className="font-bold text-2xl">
                {formatDistance(distanceToManeuver ?? currentStep.distance)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Next instruction - collapsible */}
      {nextStep && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm text-gray-600 flex-1 min-w-0">
            <span className="font-medium text-gray-500 uppercase text-xs">Después:</span>
            <span className="truncate">
              {nextStep.instruction || getManeuverText(nextStep.maneuver)}
              {nextStep.streetName && ` en ${nextStep.streetName}`}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm text-gray-500">{formatDistance(nextStep.distance)}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </button>
      )}

      {/* Expanded steps list */}
      {isExpanded && allSteps.length > 2 && (
        <div className="max-h-40 overflow-y-auto border-t border-gray-200">
          {allSteps.slice(2).map((step, index) => (
            <TurnInstruction
              key={index}
              step={step}
              variant="next"
              className="border-b border-gray-100 last:border-0"
            />
          ))}
        </div>
      )}

      {/* GPS status indicator */}
      {isTracking && (
        <div className="flex items-center justify-center gap-2 py-1.5 text-xs bg-success/10 text-success">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          GPS activo - Navegación en tiempo real
        </div>
      )}
    </div>
  );
}

// Helper functions
function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  const rounded = Math.round(meters / 10) * 10;
  return `${rounded} m`;
}

function getRotationForManeuver(maneuver: string): string {
  const rotations: Record<string, string> = {
    'straight': 'rotate(0deg)',
    'turn-left': 'rotate(-90deg)',
    'turn-right': 'rotate(90deg)',
    'turn-slight-left': 'rotate(-45deg)',
    'turn-slight-right': 'rotate(45deg)',
    'turn-sharp-left': 'rotate(-135deg)',
    'turn-sharp-right': 'rotate(135deg)',
    'uturn-left': 'rotate(-180deg)',
    'uturn-right': 'rotate(180deg)',
  };
  return rotations[maneuver] || 'rotate(0deg)';
}

function getManeuverText(maneuver: string): string {
  const texts: Record<string, string> = {
    'straight': 'Continúa recto',
    'head': 'Dirígete hacia',
    'depart': 'Inicia',
    'turn-left': 'Gira a la izquierda',
    'turn-right': 'Gira a la derecha',
    'turn-slight-left': 'Gira levemente a la izquierda',
    'turn-slight-right': 'Gira levemente a la derecha',
    'turn-sharp-left': 'Gira bruscamente a la izquierda',
    'turn-sharp-right': 'Gira bruscamente a la derecha',
    'keep-left': 'Mantente a la izquierda',
    'keep-right': 'Mantente a la derecha',
    'uturn-left': 'Gira en U',
    'uturn-right': 'Gira en U',
    'roundabout-left': 'Toma la rotonda',
    'roundabout-right': 'Toma la rotonda',
    'merge': 'Incorpórate',
    'fork-left': 'Toma el desvío izquierdo',
    'fork-right': 'Toma el desvío derecho',
    'arrive': 'Has llegado',
    'destination': 'Destino final',
  };
  return texts[maneuver] || 'Continúa';
}
