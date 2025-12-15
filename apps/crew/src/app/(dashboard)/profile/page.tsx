'use client';

import { User, Mail, Phone, CreditCard, Calendar, Building, Bus, Award, Star, Clock, Users, FileText, ChevronRight, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useConvexAuth } from '@/hooks';
import type { UserRole } from '@/types';

// Mock user for UI testing
const mockUser: { name: string; email: string; phone: string; cedula: string; birthDate: string; role: UserRole; licenseNumber: string; licenseType: string; licenseExpiry: string; institution: string; seniority: string; vehicle: { model: string; plate: string; capacity: number }; stats: { tripsCompleted: number; studentsTransported: number; punctuality: number; rating: number; checkinsCompleted: number; incidentsReported: number }; documents: { name: string; status: string; expiry: string }[] } = {
  name: 'Carlos Pérez',
  email: 'carlos.perez@altaviapp.ec',
  phone: '+593 99 123 4567',
  cedula: '1234567890',
  birthDate: '15/03/1985',
  role: 'driver',
  // Driver-specific
  licenseNumber: 'EC-1234567890',
  licenseType: 'Profesional (Tipo E)',
  licenseExpiry: '15/08/2026',
  // Institution
  institution: 'Escuela Altaviapp',
  seniority: '2 años, 3 meses',
  // Vehicle
  vehicle: {
    model: 'Toyota Coaster',
    plate: 'ABC-1234',
    capacity: 30,
  },
  // Stats
  stats: {
    tripsCompleted: 482,
    studentsTransported: 12850,
    punctuality: 98,
    rating: 4.9,
    checkinsCompleted: 3240,
    incidentsReported: 12,
  },
  // Documents
  documents: [
    { name: 'Licencia de conducir', status: 'valid', expiry: '15/08/2026' },
    { name: 'Certificado médico', status: 'valid', expiry: '20/03/2025' },
    { name: 'Antecedentes penales', status: 'valid', expiry: '10/01/2025' },
    { name: 'Curso de seguridad vial', status: 'valid', expiry: '05/06/2025' },
  ],
};

export default function ProfilePage() {
  // Use real auth with fallback to mock for UI testing
  const { user: authUser, isAuthenticated, isDriver: authIsDriver, isMonitor: authIsMonitor } = useConvexAuth();

  // Merge auth user with mock data for display
  const user = {
    ...mockUser,
    name: (isAuthenticated && authUser?.name) ? authUser.name : mockUser.name,
    email: (isAuthenticated && authUser?.email) ? authUser.email : mockUser.email,
    role: (isAuthenticated && authUser?.role) ? authUser.role as UserRole : mockUser.role,
  };
  const isDriver = isAuthenticated ? authIsDriver : user.role === 'driver';
  const isMonitor = isAuthenticated ? authIsMonitor : user.role === 'monitor';

  return (
    <div className="space-y-4 pb-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">{user.name}</h1>
            <span className={cn(
              'inline-block px-2 py-1 rounded-full text-xs font-medium mt-1',
              isDriver ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
            )}>
              {isDriver ? 'Conductor' : 'Auxiliar'}
            </span>
          </div>
          <Link
            href="/settings"
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </Link>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{user.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Cédula: {user.cedula}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Nacimiento: {user.birthDate}</span>
          </div>
        </div>
      </div>

      {/* Professional Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Building className="w-5 h-5 text-primary" />
          Información Profesional
        </h3>

        <div className="space-y-3">
          {isDriver && (
            <>
              <div>
                <p className="text-xs text-gray-500">Licencia de conducir</p>
                <p className="text-sm font-medium text-gray-900">{user.licenseNumber}</p>
                <p className="text-xs text-gray-600">{user.licenseType}</p>
                <p className="text-xs text-gray-500">Vencimiento: {user.licenseExpiry}</p>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500">Institución</p>
                <p className="text-sm font-medium text-gray-900">{user.institution}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Antigüedad</p>
                <p className="text-sm font-medium text-gray-900">{user.seniority}</p>
              </div>
            </>
          )}

          {isMonitor && (
            <>
              <div>
                <p className="text-xs text-gray-500">Institución</p>
                <p className="text-sm font-medium text-gray-900">{user.institution}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Antigüedad</p>
                <p className="text-sm font-medium text-gray-900">{user.seniority}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Vehicle Card (Driver only) */}
      {isDriver && user.vehicle && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Bus className="w-5 h-5 text-primary" />
            Vehículo Asignado
          </h3>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
              <Bus className="w-8 h-8 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{user.vehicle.model}</p>
              <p className="text-sm text-gray-600">Placa: {user.vehicle.plate}</p>
              <p className="text-sm text-gray-500">Capacidad: {user.vehicle.capacity} pasajeros</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Estadísticas
        </h3>

        {isDriver ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-primary">{user.stats.tripsCompleted}</p>
              <p className="text-xs text-gray-500">Viajes completados</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-success">{user.stats.studentsTransported.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Estudiantes transportados</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-info">{user.stats.punctuality}%</p>
              <p className="text-xs text-gray-500">Puntualidad</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <p className="text-2xl font-bold text-warning">{user.stats.rating}</p>
                <Star className="w-5 h-5 text-warning fill-warning" />
              </div>
              <p className="text-xs text-gray-500">Calificación</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-primary">{user.stats.checkinsCompleted?.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Check-ins realizados</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-warning">{user.stats.incidentsReported}</p>
              <p className="text-xs text-gray-500">Incidentes reportados</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-success">99%</p>
              <p className="text-xs text-gray-500">Asistencia</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <p className="text-2xl font-bold text-warning">{user.stats.rating}</p>
                <Star className="w-5 h-5 text-warning fill-warning" />
              </div>
              <p className="text-xs text-gray-500">Calificación</p>
            </div>
          </div>
        )}

        <button className="w-full mt-3 text-sm text-primary hover:underline flex items-center justify-center gap-1">
          Ver estadísticas completas
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Documentos
          </h3>
        </div>

        {user.documents.map((doc, index) => (
          <div
            key={index}
            className={cn(
              'p-4 flex items-center justify-between',
              index < user.documents.length - 1 && 'border-b border-gray-100'
            )}
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
              <p className="text-xs text-gray-500">Vence: {doc.expiry}</p>
            </div>
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              doc.status === 'valid' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
            )}>
              {doc.status === 'valid' ? 'Vigente' : 'Vencido'}
            </span>
          </div>
        ))}

        <button className="w-full p-4 text-sm text-primary hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
          Ver todos los documentos
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
