/**
 * Trip Components Barrel Export
 */

export { TripHeader } from './TripHeader';
export { TripProgress } from './TripProgress';
export { GPSStatus } from './GPSStatus';
export { NextStopCard } from './NextStopCard';
export { QuickActions } from './QuickActions';

export type { TripHeaderProps } from './TripHeader';
export type { TripProgressProps } from './TripProgress';
export type { GPSStatusProps } from './GPSStatus';
export type { NextStopCardProps } from './NextStopCard';
export type { QuickActionsProps } from './QuickActions';

// Trip Detail Components (tabs)
export { TripDetailTabs, TripHistorialTab } from './detail';
export type { TripDetailTab } from './detail';

// Map components are now from @altaviapp/maps
// Use: import { GoogleMapsProvider, GoogleRouteMap } from '@altaviapp/maps';
