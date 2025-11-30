import type { Notification } from '@/types';

/**
 * Mock Notifications (5 recent notifications)
 */
export const mockNotifications: Notification[] = [
  {
    _id: 'notif-001',
    userId: 'driver-001',
    type: 'info',
    title: 'Nuevo estudiante añadido a su ruta',
    message: 'Se ha agregado a Felipe Domínguez (7mo B) a la ruta Centro - Escuela A',
    actionUrl: '/students/student-028',
    read: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'notif-002',
    userId: 'driver-001',
    type: 'warning',
    title: 'Mantenimiento programado para el 10/01',
    message: 'El vehículo ABC-1234 tiene mantenimiento programado. Confirme su disponibilidad.',
    actionUrl: '/vehicle/vehicle-001',
    read: false,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'notif-003',
    userId: 'driver-001',
    type: 'success',
    title: 'Viaje completado exitosamente',
    message: 'El viaje de vuelta del 25/11/2025 se completó sin incidentes. 28 estudiantes transportados.',
    actionUrl: '/trips/trip-yesterday-vuelta',
    read: true,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'notif-004',
    userId: 'driver-001',
    type: 'info',
    title: 'Actualización de ruta',
    message: 'Se modificó el horario de la ruta de vuelta. Nuevo horario: 14:00 - 15:00',
    actionUrl: '/routes/route-002',
    read: true,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'notif-005',
    userId: 'driver-001',
    type: 'info',
    title: 'Recordatorio: Revisión técnica vehicular',
    message: 'La revisión técnica del vehículo vence el 15/06/2025. Programe su cita con anticipación.',
    actionUrl: '/vehicle/vehicle-001',
    read: true,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
