import type { User } from '@/types';

/**
 * Mock Driver Data
 * Credenciales de login: conductor@altaviapp.ec / demo123
 */
export const mockDriver: User = {
  _id: 'driver-001',
  email: 'conductor@altaviapp.ec',
  name: 'Juan Pérez',
  role: 'driver',
  institutionId: 'inst-001',
  isActive: true,
  avatar: '/avatars/driver-001.jpg',
  phone: '+593987654321',
  cedula: '1720345678',
  dateOfBirth: '1985-03-15',
  licenseNumber: 'EC-D-123456',
  licenseType: 'Tipo D (Transporte Público)',
  licenseExpiry: '2026-12-31',
  createdAt: '2024-01-15T00:00:00Z',
};

/**
 * Mock Parent User (para futuro testing)
 */
export const mockParent: User = {
  _id: 'parent-001',
  email: 'padre@altaviapp.ec',
  name: 'María González',
  role: 'parent',
  institutionId: 'inst-001',
  isActive: true,
  phone: '+593998765432',
  createdAt: '2024-01-20T00:00:00Z',
};

/**
 * Mock Monitor User (Auxiliar)
 * Credenciales de login: monitor@altaviapp.ec / demo123
 */
export const mockMonitor: User = {
  _id: 'monitor-001',
  email: 'monitor@altaviapp.ec',
  name: 'Ana Martínez',
  role: 'monitor',
  institutionId: 'inst-001',
  isActive: true,
  avatar: '/avatars/monitor-001.jpg',
  phone: '+593987654322',
  cedula: '1720345679',
  dateOfBirth: '1990-07-22',
  createdAt: '2024-02-01T00:00:00Z',
};

/**
 * Mock Admin User (Coordinador)
 */
export const mockAdmin: User = {
  _id: 'admin-001',
  email: 'admin@altaviapp.ec',
  name: 'Carlos Rodríguez',
  role: 'admin',
  institutionId: 'inst-001',
  isActive: true,
  phone: '+593991234567',
  createdAt: '2024-01-10T00:00:00Z',
};
