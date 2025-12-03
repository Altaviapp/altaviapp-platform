import type { Incident } from '@/types';

/**
 * Mock Incidents (for testing incident reporting)
 */
export const mockIncidents: Incident[] = [
  {
    _id: 'incident-001',
    tripId: 'trip-yesterday-ida',
    driverId: 'driver-001',
    institutionId: 'inst-001',
    type: 'delay',
    severity: 'minor',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    latitude: -0.2207,
    longitude: -78.5133,
    description: 'Tráfico pesado en el centro histórico debido a evento público',
    delayMinutes: 15,
    delayReason: 'Tráfico pesado',
    notifiedAdmins: true,
    notifiedParents: true,
    reportNumber: 'INC-2025-001',
    status: 'resolved',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'incident-002',
    tripId: 'trip-lastweek-ida',
    driverId: 'driver-001',
    institutionId: 'inst-001',
    type: 'mechanical',
    severity: 'moderate',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last week
    latitude: -0.1841,
    longitude: -78.4874,
    description: 'Llanta pinchada en la Av. Naciones Unidas. Se cambió por la de repuesto.',
    delayMinutes: 25,
    photos: ['/incidents/inc-002-photo-1.jpg'],
    notifiedAdmins: true,
    notifiedParents: true,
    reportNumber: 'INC-2025-002',
    status: 'resolved',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
