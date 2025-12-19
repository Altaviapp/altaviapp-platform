'use client';

import { User, Mail, Phone, CreditCard, Calendar, Building, Bus, Award, Star, Clock, Users, FileText, ChevronRight, Settings, Edit2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useConvexAuth, useDriverProfile, useMonitorProfile } from '@/hooks';
import type { UserRole } from '@/types';

// Mock stats for display (will be replaced with real data when available)
const mockStats = {
  tripsCompleted: 482,
  studentsTransported: 12850,
  punctuality: 98,
  rating: 4.9,
  checkinsCompleted: 3240,
  incidentsReported: 12,
};

// Mock documents for display (will be replaced with real data when available)
const mockDocuments = [
  { name: 'Licencia de conducir', status: 'valid', expiry: '15/08/2026' },
  { name: 'Certificado médico', status: 'valid', expiry: '20/03/2025' },
  { name: 'Antecedentes penales', status: 'valid', expiry: '10/01/2025' },
  { name: 'Curso de seguridad vial', status: 'valid', expiry: '05/06/2025' },
];

const LICENSE_TYPES: Record<string, string> = {
  'A': 'Tipo A - Motocicletas',
  'B': 'Tipo B - Vehículos livianos',
  'C': 'Tipo C - Taxis y camionetas',
  'D': 'Tipo D - Buses y busetas',
  'E': 'Tipo E - Camiones y tractomulas',
  'F': 'Tipo F - Especiales',
  'G': 'Tipo G - Maquinaria',
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function ProfilePage() {
  const { user: authUser, isAuthenticated, isDriver, isMonitor, isLoading: authLoading } = useConvexAuth();

  const driverProfile = useDriverProfile();
  const monitorProfile = useMonitorProfile();

  const profile = isDriver ? driverProfile.profile : isMonitor ? monitorProfile.profile : null;
  const profileCompleted = isDriver ? driverProfile.profileCompleted : isMonitor ? monitorProfile.profileCompleted : false;
  const isLoading = authLoading || (isDriver ? driverProfile.isLoading : monitorProfile.isLoading);

  // Get user data from auth or profile
  const userName = authUser?.name || 'Usuario';
  const userEmail = authUser?.email || '';
  const userPhone = profile?.phone || profile?.user?.phone;

  return (
    <div className="space-y-4 pb-8">
      {/* Profile completion alert */}
      {!isLoading && !profileCompleted && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warning">Perfil incompleto</p>
              <p className="text-xs text-warning/80 mt-1">
                Completa tu información profesional para poder operar viajes.
              </p>
              <Link
                href="/profile/edit"
                className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-warning hover:underline"
              >
                <Edit2 className="w-4 h-4" />
                Completar perfil
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {userName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">{userName}</h1>
            <span className={cn(
              'inline-block px-2 py-1 rounded-full text-xs font-medium mt-1',
              isDriver ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
            )}>
              {isDriver ? 'Conductor' : isMonitor ? 'Auxiliar' : 'Usuario'}
            </span>
          </div>
          <Link
            href="/profile/edit"
            className="p-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <Edit2 className="w-5 h-5" />
          </Link>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{userEmail || 'No configurado'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className={cn('text-gray-600', !userPhone && 'italic text-gray-400')}>
              {userPhone || 'No configurado'}
            </span>
          </div>
          {isMonitor && monitorProfile.profile?.idNumber && (
            <div className="flex items-center gap-3 text-sm">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Cédula: {monitorProfile.profile.idNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Professional Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Building className="w-5 h-5 text-primary" />
          Información Profesional
        </h3>

        <div className="space-y-3">
          {isDriver && driverProfile.profile && (
            <>
              <div>
                <p className="text-xs text-gray-500">Licencia de conducir</p>
                {driverProfile.profile.licenseNumber ? (
                  <>
                    <p className="text-sm font-medium text-gray-900">{driverProfile.profile.licenseNumber}</p>
                    {driverProfile.profile.licenseType && (
                      <p className="text-xs text-gray-600">
                        {LICENSE_TYPES[driverProfile.profile.licenseType] || driverProfile.profile.licenseType}
                      </p>
                    )}
                    {driverProfile.profile.licenseExpiry && (
                      <p className="text-xs text-gray-500">
                        Vencimiento: {formatDate(driverProfile.profile.licenseExpiry)}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400 italic">No configurado</p>
                )}
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500">Contacto de emergencia</p>
                <p className={cn(
                  'text-sm font-medium',
                  driverProfile.profile.emergencyContact ? 'text-gray-900' : 'text-gray-400 italic'
                )}>
                  {driverProfile.profile.emergencyContact || 'No configurado'}
                </p>
              </div>
            </>
          )}

          {isMonitor && monitorProfile.profile && (
            <>
              <div>
                <p className="text-xs text-gray-500">Certificaciones</p>
                <div className="mt-1 space-y-1">
                  <p className={cn(
                    'text-sm',
                    monitorProfile.profile.firstAidCertified ? 'text-success' : 'text-gray-400'
                  )}>
                    {monitorProfile.profile.firstAidCertified ? '✓' : '○'} Primeros auxilios
                    {monitorProfile.profile.firstAidCertified && monitorProfile.profile.firstAidCertExpiry && (
                      <span className="text-xs text-gray-500 ml-1">
                        (vence: {formatDate(monitorProfile.profile.firstAidCertExpiry)})
                      </span>
                    )}
                  </p>
                  <p className={cn(
                    'text-sm',
                    monitorProfile.profile.childCareCertified ? 'text-success' : 'text-gray-400'
                  )}>
                    {monitorProfile.profile.childCareCertified ? '✓' : '○'} Cuidado infantil
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500">Contacto de emergencia</p>
                <p className={cn(
                  'text-sm font-medium',
                  monitorProfile.profile.emergencyContact ? 'text-gray-900' : 'text-gray-400 italic'
                )}>
                  {monitorProfile.profile.emergencyContact || 'No configurado'}
                </p>
              </div>
            </>
          )}

          {!isDriver && !isMonitor && (
            <p className="text-sm text-gray-500 italic">
              No tienes un rol de conductor o auxiliar asignado.
            </p>
          )}
        </div>
      </div>

      {/* Vehicle Card (Driver only) - TODO: Connect to real vehicle data */}
      {/* Vehicle assignment will be shown when routes are assigned to the driver */}

      {/* Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Estadísticas
        </h3>

        {isDriver ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-primary">{mockStats.tripsCompleted}</p>
              <p className="text-xs text-gray-500">Viajes completados</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-success">{mockStats.studentsTransported.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Estudiantes transportados</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-info">{mockStats.punctuality}%</p>
              <p className="text-xs text-gray-500">Puntualidad</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <p className="text-2xl font-bold text-warning">{mockStats.rating}</p>
                <Star className="w-5 h-5 text-warning fill-warning" />
              </div>
              <p className="text-xs text-gray-500">Calificación</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-primary">{mockStats.checkinsCompleted?.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Check-ins realizados</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-warning">{mockStats.incidentsReported}</p>
              <p className="text-xs text-gray-500">Incidentes reportados</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-success">99%</p>
              <p className="text-xs text-gray-500">Asistencia</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <p className="text-2xl font-bold text-warning">{mockStats.rating}</p>
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

        {mockDocuments.map((doc, index) => (
          <div
            key={index}
            className={cn(
              'p-4 flex items-center justify-between',
              index < mockDocuments.length - 1 && 'border-b border-gray-100'
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
