import type { Route, Stop } from '@/types';

/**
 * Mock Routes
 */
export const mockRouteIda: Route = {
  _id: 'route-001',
  institutionId: 'inst-001',
  name: 'Centro - Escuela A',
  description: 'Ruta de ida desde el centro hacia la Escuela A',
  type: 'inbound',
  vehicleId: 'vehicle-001',
  driverId: 'driver-001',
  startTime: '06:30',
  endTime: '07:30',
  daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  isActive: true,
  createdAt: '2024-01-15T00:00:00Z',
};

export const mockRouteVuelta: Route = {
  _id: 'route-002',
  institutionId: 'inst-001',
  name: 'Escuela A - Centro',
  description: 'Ruta de vuelta desde la Escuela A hacia el centro',
  type: 'outbound',
  vehicleId: 'vehicle-001',
  driverId: 'driver-001',
  startTime: '14:00',
  endTime: '15:00',
  daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  isActive: true,
  createdAt: '2024-01-15T00:00:00Z',
};

export const mockRoutes: Route[] = [mockRouteIda, mockRouteVuelta];

/**
 * Mock Stops for Ida route (8 stops)
 * Coordenadas reales de Quito, Ecuador
 */
export const mockStopsIda: Stop[] = [
  {
    _id: 'stop-001',
    routeId: 'route-001',
    order: 1,
    name: 'Terminal Quitumbe',
    address: 'Av. Maldonado y Cóndor Ñan',
    latitude: -0.2903,
    longitude: -78.5481,
    estimatedArrivalTime: '06:35',
    students: ['student-001', 'student-002', 'student-003'],
  },
  {
    _id: 'stop-002',
    routeId: 'route-001',
    order: 2,
    name: 'El Recreo',
    address: 'Av. Pedro Vicente Maldonado',
    latitude: -0.2557,
    longitude: -78.5284,
    estimatedArrivalTime: '06:42',
    students: ['student-004', 'student-005'],
  },
  {
    _id: 'stop-003',
    routeId: 'route-001',
    order: 3,
    name: 'La Magdalena',
    address: 'Av. Mariscal Sucre',
    latitude: -0.2346,
    longitude: -78.5186,
    estimatedArrivalTime: '06:48',
    students: ['student-006', 'student-007', 'student-008'],
  },
  {
    _id: 'stop-004',
    routeId: 'route-001',
    order: 4,
    name: 'Plaza Grande',
    address: 'García Moreno y Chile',
    latitude: -0.2207,
    longitude: -78.5133,
    estimatedArrivalTime: '06:54',
    students: ['student-009', 'student-010'],
  },
  {
    _id: 'stop-005',
    routeId: 'route-001',
    order: 5,
    name: 'La Carolina',
    address: 'Av. Naciones Unidas y Av. Shyris',
    latitude: -0.1841,
    longitude: -78.4874,
    estimatedArrivalTime: '07:02',
    students: ['student-011', 'student-012', 'student-013', 'student-014'],
  },
  {
    _id: 'stop-006',
    routeId: 'route-001',
    order: 6,
    name: 'La Floresta',
    address: 'Av. 12 de Octubre y Coruña',
    latitude: -0.1978,
    longitude: -78.4935,
    estimatedArrivalTime: '07:08',
    students: ['student-015', 'student-016'],
  },
  {
    _id: 'stop-007',
    routeId: 'route-001',
    order: 7,
    name: 'El Batán',
    address: 'Av. 6 de Diciembre y Eloy Alfaro',
    latitude: -0.1715,
    longitude: -78.4867,
    estimatedArrivalTime: '07:15',
    students: ['student-017', 'student-018', 'student-019'],
  },
  {
    _id: 'stop-008',
    routeId: 'route-001',
    order: 8,
    name: 'Escuela A (Destino)',
    address: 'Av. Occidental y Mariana de Jesús',
    latitude: -0.1638,
    longitude: -78.4950,
    estimatedArrivalTime: '07:25',
    students: ['student-020', 'student-021', 'student-022', 'student-023', 'student-024', 'student-025', 'student-026', 'student-027', 'student-028'],
  },
];

/**
 * Mock Stops for Vuelta route (6 stops)
 */
export const mockStopsVuelta: Stop[] = [
  {
    _id: 'stop-101',
    routeId: 'route-002',
    order: 1,
    name: 'Escuela A (Origen)',
    address: 'Av. Occidental y Mariana de Jesús',
    latitude: -0.1638,
    longitude: -78.4950,
    estimatedArrivalTime: '14:05',
    students: ['student-001', 'student-002', 'student-003', 'student-004', 'student-005', 'student-006', 'student-007', 'student-008'],
  },
  {
    _id: 'stop-102',
    routeId: 'route-002',
    order: 2,
    name: 'El Batán',
    address: 'Av. 6 de Diciembre y Eloy Alfaro',
    latitude: -0.1715,
    longitude: -78.4867,
    estimatedArrivalTime: '14:15',
    students: ['student-009', 'student-010', 'student-011'],
  },
  {
    _id: 'stop-103',
    routeId: 'route-002',
    order: 3,
    name: 'La Carolina',
    address: 'Av. Naciones Unidas y Av. Shyris',
    latitude: -0.1841,
    longitude: -78.4874,
    estimatedArrivalTime: '14:23',
    students: ['student-012', 'student-013', 'student-014', 'student-015', 'student-016'],
  },
  {
    _id: 'stop-104',
    routeId: 'route-002',
    order: 4,
    name: 'La Magdalena',
    address: 'Av. Mariscal Sucre',
    latitude: -0.2346,
    longitude: -78.5186,
    estimatedArrivalTime: '14:35',
    students: ['student-017', 'student-018', 'student-019', 'student-020'],
  },
  {
    _id: 'stop-105',
    routeId: 'route-002',
    order: 5,
    name: 'El Recreo',
    address: 'Av. Pedro Vicente Maldonado',
    latitude: -0.2557,
    longitude: -78.5284,
    estimatedArrivalTime: '14:42',
    students: ['student-021', 'student-022', 'student-023'],
  },
  {
    _id: 'stop-106',
    routeId: 'route-002',
    order: 6,
    name: 'Terminal Quitumbe (Destino)',
    address: 'Av. Maldonado y Cóndor Ñan',
    latitude: -0.2903,
    longitude: -78.5481,
    estimatedArrivalTime: '14:55',
    students: ['student-024', 'student-025', 'student-026', 'student-027', 'student-028'],
  },
];

export const mockStops: Stop[] = [...mockStopsIda, ...mockStopsVuelta];
