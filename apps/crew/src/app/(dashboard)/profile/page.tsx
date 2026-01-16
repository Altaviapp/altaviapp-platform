'use client';

import Link from 'next/link';
import {
  User, Mail, Phone, Building, Edit2, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConvexAuth, useDriverProfile, useMonitorProfile } from '@/hooks';
import { LoadingState, Card, CardContent, Badge } from '@/components/core';

const LICENSE_TYPES: Record<string, string> = {
  'A': 'Tipo A - Motocicletas',
  'B': 'Tipo B - Vehiculos livianos',
  'C': 'Tipo C - Taxis y camionetas',
  'D': 'Tipo D - Buses y busetas',
  'E': 'Tipo E - Camiones y tractomulas',
  'F': 'Tipo F - Especiales',
  'G': 'Tipo G - Maquinaria',
};

export default function ProfilePage() {
  // Auth and profile hooks
  const { user: authUser, isDriver, isMonitor, isLoading: authLoading } = useConvexAuth();
  const driverProfile = useDriverProfile();
  const monitorProfile = useMonitorProfile();

  const profile = isDriver ? driverProfile.profile : isMonitor ? monitorProfile.profile : null;
  const profileCompleted = isDriver ? driverProfile.profileCompleted : isMonitor ? monitorProfile.profileCompleted : false;
  const isLoading = authLoading || (isDriver ? driverProfile.isLoading : monitorProfile.isLoading);

  const userName = authUser?.name || 'Usuario';
  const userEmail = authUser?.email || '';
  const userPhone = profile?.phone || profile?.user?.phone;

  if (isLoading) {
    return <LoadingState message="Cargando perfil..." />;
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Profile completion alert */}
      {!profileCompleted && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warning">Perfil incompleto</p>
              <p className="text-xs text-warning/80 mt-1">
                Completa tu informacion profesional para poder operar viajes.
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
      <Card>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {userName.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">{userName}</h1>
              <Badge variant={isDriver ? 'info' : 'success'} className="mt-1">
                {isDriver ? 'Conductor' : isMonitor ? 'Auxiliar' : 'Usuario'}
              </Badge>
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
          </div>
        </CardContent>
      </Card>

      {/* Professional Info */}
      <Card>
        <CardContent>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Informacion Profesional
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
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No configurado</p>
                  )}
                </div>
              </>
            )}

            {isMonitor && monitorProfile.profile && (
              <div>
                <p className="text-xs text-gray-500">Certificaciones</p>
                <div className="mt-1 space-y-1">
                  <p className={cn('text-sm', monitorProfile.profile.firstAidCertified ? 'text-success' : 'text-gray-400')}>
                    {monitorProfile.profile.firstAidCertified ? '✓' : '○'} Primeros auxilios
                  </p>
                  <p className={cn('text-sm', monitorProfile.profile.childCareCertified ? 'text-success' : 'text-gray-400')}>
                    {monitorProfile.profile.childCareCertified ? '✓' : '○'} Cuidado infantil
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
