'use client';

/**
 * Profile Edit Page
 *
 * Allows crew members (drivers/monitors) to complete their professional profile.
 * Shows:
 * - Global section (phone, emergency contact) for all roles
 * - Role-specific section (license for drivers, cedula/certificates for monitors)
 */

import { User, AlertCircle, CheckCircle } from 'lucide-react';
import { useConvexAuth, useDriverProfile, useMonitorProfile } from '@/hooks';
import { GlobalProfileSection, DriverProfileSection, MonitorProfileSection } from '@/components/profile';
import { Card, CardContent, Badge } from '@/components/core';
import { PageHeader } from '@/components/shared';

export default function ProfileEditPage() {
  const { user, isAuthenticated, isDriver, isMonitor, isLoading: authLoading } = useConvexAuth();

  const driverProfile = useDriverProfile();
  const monitorProfile = useMonitorProfile();

  const profile = isDriver ? driverProfile.profile : isMonitor ? monitorProfile.profile : null;
  const profileCompleted = isDriver ? driverProfile.profileCompleted : isMonitor ? monitorProfile.profileCompleted : false;
  const isLoading = authLoading || (isDriver ? driverProfile.isLoading : monitorProfile.isLoading);

  // Handle global profile updates
  const handleGlobalSave = async (data: { phone?: string; emergencyContact?: string }) => {
    if (isDriver && driverProfile.updateProfile) {
      await driverProfile.updateProfile(data);
    } else if (isMonitor && monitorProfile.updateProfile) {
      await monitorProfile.updateProfile(data);
    }
  };

  // Handle driver-specific updates
  const handleDriverSave = async (data: {
    licenseNumber?: string;
    licenseType?: string;
    licenseExpiry?: number;
  }) => {
    if (driverProfile.updateProfile) {
      await driverProfile.updateProfile(data);
    }
  };

  // Handle monitor-specific updates
  const handleMonitorSave = async (data: {
    idNumber?: string;
    firstAidCertified?: boolean;
    firstAidCertExpiry?: number;
    childCareCertified?: boolean;
  }) => {
    if (monitorProfile.updateProfile) {
      await monitorProfile.updateProfile(data);
    }
  };

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="p-4">
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-center">
          <AlertCircle className="w-8 h-8 text-warning mx-auto mb-2" />
          <p className="text-warning">Debes iniciar sesión para editar tu perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <PageHeader
        title="Editar Perfil"
        subtitle="Completa tu información profesional"
        backHref="/profile"
      />

      {/* Profile completion status */}
      {!isLoading && (
        profileCompleted ? (
          <div className="bg-success/10 border border-success/20 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-success">Perfil completo</p>
              <p className="text-xs text-success/80">Toda tu información está actualizada</p>
            </div>
          </div>
        ) : (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-warning">Perfil incompleto</p>
              <p className="text-xs text-warning/80">Completa los campos requeridos para continuar</p>
            </div>
          </div>
        )
      )}

      {/* User Info Card */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
              {user?.name ? (
                <span className="text-xl font-bold text-white">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {user?.name || 'Cargando...'}
              </h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <Badge variant={isDriver ? 'info' : 'success'} className="mt-1">
                {isDriver ? 'Conductor' : isMonitor ? 'Auxiliar' : 'Usuario'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Sections */}
      <div className="space-y-4">
        {/* Global Section - Contact Info */}
        <GlobalProfileSection
          phone={profile?.phone}
          emergencyContact={profile?.emergencyContact}
          onSave={handleGlobalSave}
          isLoading={isLoading}
        />

        {/* Role-specific sections */}
        {isDriver && (
          <DriverProfileSection
            licenseNumber={driverProfile.profile?.licenseNumber}
            licenseType={driverProfile.profile?.licenseType}
            licenseExpiry={driverProfile.profile?.licenseExpiry}
            onSave={handleDriverSave}
            isLoading={driverProfile.isLoading}
          />
        )}

        {isMonitor && (
          <MonitorProfileSection
            idNumber={monitorProfile.profile?.idNumber}
            firstAidCertified={monitorProfile.profile?.firstAidCertified}
            firstAidCertExpiry={monitorProfile.profile?.firstAidCertExpiry}
            childCareCertified={monitorProfile.profile?.childCareCertified}
            onSave={handleMonitorSave}
            isLoading={monitorProfile.isLoading}
          />
        )}
      </div>

    </div>
  );
}
