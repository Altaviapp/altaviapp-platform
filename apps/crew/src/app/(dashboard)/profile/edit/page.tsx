'use client';

/**
 * Profile Edit Page
 *
 * Allows crew members (drivers/monitors) to complete their professional profile.
 * Shows:
 * - Global section (phone, emergency contact) for all roles
 * - Role-specific section (license for drivers, cedula/certificates for monitors)
 */

import { ArrowLeft, User, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useConvexAuth, useDriverProfile, useMonitorProfile } from '@/hooks';
import { GlobalProfileSection, DriverProfileSection, MonitorProfileSection } from '@/components/profile';
import { cn } from '@/lib/utils';

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
    <div className="pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 mb-4 -mx-4 -mt-4">
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Editar Perfil</h1>
            <p className="text-sm text-gray-500">Completa tu información profesional</p>
          </div>
        </div>
      </div>

      {/* Profile completion status */}
      {!isLoading && (
        <div className={cn(
          'mb-4 p-4 rounded-lg border flex items-center gap-3',
          profileCompleted
            ? 'bg-success/10 border-success/20'
            : 'bg-warning/10 border-warning/20'
        )}>
          {profileCompleted ? (
            <>
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-success">Perfil completo</p>
                <p className="text-xs text-success/80">Toda tu información está actualizada</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-warning">Perfil incompleto</p>
                <p className="text-xs text-warning/80">Completa los campos requeridos para continuar</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* User Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
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
            <span className={cn(
              'inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1',
              isDriver ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
            )}>
              {isDriver ? 'Conductor' : isMonitor ? 'Auxiliar' : 'Usuario'}
            </span>
          </div>
        </div>
      </div>

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

      {/* Back to profile link */}
      <div className="mt-6 text-center">
        <Link
          href="/profile"
          className="text-sm text-primary hover:underline"
        >
          ← Volver al perfil
        </Link>
      </div>
    </div>
  );
}
