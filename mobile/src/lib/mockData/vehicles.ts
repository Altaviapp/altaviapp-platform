import type { Vehicle } from '@/types';

/**
 * Mock Vehicle assigned to the driver
 */
export const mockVehicle: Vehicle = {
  _id: 'vehicle-001',
  institutionId: 'inst-001',
  plate: 'ABC-1234',
  brand: 'Toyota',
  model: 'Coaster',
  year: 2020,
  color: 'Amarillo',
  capacity: 30,
  status: 'active',
  driverId: 'driver-001',
  registrationNumber: 'REG-2020-001',
  insurancePolicy: 'POL-123456',
  insuranceExpiry: '2025-12-31',
  lastTechnicalReview: '2024-06-15',
  nextTechnicalReview: '2025-06-15',
  createdAt: '2024-01-15T00:00:00Z',
};

/**
 * Additional mock vehicles (for admin views)
 */
export const mockVehicles: Vehicle[] = [
  mockVehicle,
  {
    _id: 'vehicle-002',
    institutionId: 'inst-001',
    plate: 'XYZ-5678',
    brand: 'Chevrolet',
    model: 'NKR',
    year: 2019,
    color: 'Blanco',
    capacity: 25,
    status: 'active',
    driverId: 'driver-002',
    registrationNumber: 'REG-2019-045',
    insurancePolicy: 'POL-123457',
    insuranceExpiry: '2025-08-30',
    lastTechnicalReview: '2024-05-10',
    nextTechnicalReview: '2025-05-10',
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    _id: 'vehicle-003',
    institutionId: 'inst-001',
    plate: 'DEF-9012',
    brand: 'Hino',
    model: 'FC',
    year: 2021,
    color: 'Azul',
    capacity: 35,
    status: 'maintenance',
    registrationNumber: 'REG-2021-012',
    insurancePolicy: 'POL-123458',
    insuranceExpiry: '2026-03-15',
    lastTechnicalReview: '2024-07-20',
    nextTechnicalReview: '2025-07-20',
    createdAt: '2024-02-01T00:00:00Z',
  },
];
