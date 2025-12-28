/**
 * Notification Category Configuration
 *
 * Defines icons and colors for each notification category and type.
 */

import {
  Bell,
  Bus,
  CheckCircle,
  AlertTriangle,
  Clock,
  Info,
  MapPin,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';

export interface CategoryConfig {
  icon: LucideIcon;
  color: string;
  bg: string;
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  checkin: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  trip_update: { icon: Bus, color: 'text-info', bg: 'bg-info/10' },
  eta: { icon: MapPin, color: 'text-warning', bg: 'bg-warning/10' },
  novedad: { icon: Bell, color: 'text-primary', bg: 'bg-primary/10' },
  incident: { icon: AlertTriangle, color: 'text-error', bg: 'bg-error/10' },
  relay: { icon: RefreshCw, color: 'text-info', bg: 'bg-info/10' },
  approval_request: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  system: { icon: Info, color: 'text-gray-500', bg: 'bg-gray-100' },
} as const;

export const TYPE_CONFIG: Record<string, CategoryConfig> = {
  success: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  info: { icon: Info, color: 'text-info', bg: 'bg-info/10' },
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
  error: { icon: AlertTriangle, color: 'text-error', bg: 'bg-error/10' },
} as const;

/**
 * Get configuration for a notification based on category or type
 */
export function getNotificationConfig(
  category?: string,
  type?: string
): CategoryConfig {
  if (category && category in CATEGORY_CONFIG) {
    return CATEGORY_CONFIG[category]!;
  }
  if (type && type in TYPE_CONFIG) {
    return TYPE_CONFIG[type]!;
  }
  return TYPE_CONFIG.info!;
}
