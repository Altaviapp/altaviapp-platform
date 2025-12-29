'use client';

import {
  ArrowUp,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  ArrowDown,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpLeft,
  RotateCcw,
  RotateCw,
  MapPin,
  Flag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ManeuverType =
  | 'straight'
  | 'turn-left'
  | 'turn-right'
  | 'turn-slight-left'
  | 'turn-slight-right'
  | 'turn-sharp-left'
  | 'turn-sharp-right'
  | 'uturn-left'
  | 'uturn-right'
  | 'roundabout-left'
  | 'roundabout-right'
  | 'merge'
  | 'fork-left'
  | 'fork-right'
  | 'keep-left'
  | 'keep-right'
  | 'ramp-left'
  | 'ramp-right'
  | 'arrive'
  | 'depart'
  | 'waypoint';

interface ManeuverIconProps {
  maneuver: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export function ManeuverIcon({ maneuver, size = 'md', className }: ManeuverIconProps) {
  const sizeClass = sizeMap[size];

  // Map maneuver to icon component
  const getIcon = () => {
    switch (maneuver) {
      case 'straight':
      case 'head':
      case 'depart':
        return ArrowUp;
      case 'turn-left':
        return ArrowLeft;
      case 'turn-right':
        return ArrowRight;
      case 'turn-slight-left':
      case 'keep-left':
      case 'fork-left':
      case 'ramp-left':
        return ArrowUpLeft;
      case 'turn-slight-right':
      case 'keep-right':
      case 'fork-right':
      case 'ramp-right':
        return ArrowUpRight;
      case 'turn-sharp-left':
        return ArrowDownLeft;
      case 'turn-sharp-right':
        return ArrowDownRight;
      case 'uturn-left':
        return RotateCcw;
      case 'uturn-right':
        return RotateCw;
      case 'roundabout-left':
        return RotateCcw;
      case 'roundabout-right':
        return RotateCw;
      case 'arrive':
      case 'waypoint':
        return MapPin;
      case 'destination':
        return Flag;
      default:
        return ArrowUp;
    }
  };

  const Icon = getIcon();

  return (
    <div className={cn(
      'flex items-center justify-center rounded-full bg-primary text-white',
      sizeClass === 'w-5 h-5' && 'p-1',
      sizeClass === 'w-8 h-8' && 'p-2',
      sizeClass === 'w-12 h-12' && 'p-3',
      className
    )}>
      <Icon className={sizeClass} />
    </div>
  );
}

// Spanish translations for maneuvers
export const maneuverTranslations: Record<string, string> = {
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
  'uturn-left': 'Gira en U a la izquierda',
  'uturn-right': 'Gira en U a la derecha',
  'roundabout-left': 'Toma la rotonda (izquierda)',
  'roundabout-right': 'Toma la rotonda (derecha)',
  'merge': 'Incorpórate',
  'fork-left': 'Toma el desvío izquierdo',
  'fork-right': 'Toma el desvío derecho',
  'ramp-left': 'Toma la rampa izquierda',
  'ramp-right': 'Toma la rampa derecha',
  'arrive': 'Llegada',
  'destination': 'Destino',
  'waypoint': 'Punto de referencia',
};
