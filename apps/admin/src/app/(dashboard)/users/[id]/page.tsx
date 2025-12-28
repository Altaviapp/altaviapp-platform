'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Edit,
  Trash2,
  Phone,
  Mail,
  Shield,
  Calendar,
  Loader2,
  UserCheck,
  UserX,
  Clock,
} from 'lucide-react';
import {
  PageHeader,
  StatusBadge,
  DetailSection,
  DetailItem,
  DetailGrid,
  ConfirmDialog,
} from '@/components/shared';
import { useUser, useUserMutations } from '@/hooks';
import { formatTimeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  super_admin: { label: 'Super Admin', color: 'text-red-700', bg: 'bg-red-100' },
  admin: { label: 'Administrador', color: 'text-purple-700', bg: 'bg-purple-100' },
  driver: { label: 'Conductor', color: 'text-blue-700', bg: 'bg-blue-100' },
  monitor: { label: 'Monitor', color: 'text-green-700', bg: 'bg-green-100' },
  parent: { label: 'Padre', color: 'text-amber-700', bg: 'bg-amber-100' },
};

function formatDate(timestamp?: number): string {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleDateString('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * User Detail Page
 *
 * Shows complete user information with actions to edit, activate/deactivate.
 * Connected to real Convex data.
 *
 * PRD Reference: Users Module - /users/[id]
 */
export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Real data from Convex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user, isLoading, notFound } = useUser(userId as any);
  const { deactivateUser, reactivateUser } = useUserMutations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando usuario...</span>
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Usuario no encontrado</p>
        <Link href="/users" className="text-primary hover:underline mt-2 inline-block">
          Volver a Usuarios
        </Link>
      </div>
    );
  }

  const isActive = user.isActive !== false;
  const roleInfo = ROLE_CONFIG[user.role] ?? { label: user.role, color: 'text-gray-700', bg: 'bg-gray-100' };
  const userName = user.name || 'Sin nombre';

  const handleToggleActive = async () => {
    setIsProcessing(true);
    try {
      if (isActive) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await deactivateUser(userId as any);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await reactivateUser(userId as any);
      }
      setShowDeactivateDialog(false);
    } catch (error) {
      console.error('Error toggling user status:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={userName}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Usuarios', href: '/users' },
          { label: userName },
        ]}
        backHref="/users"
        badge={
          <StatusBadge
            status={isActive ? 'active' : 'inactive'}
            label={isActive ? 'Activo' : 'Inactivo'}
          />
        }
        actions={[
          {
            label: 'Editar',
            href: `/settings/users/${userId}/edit`,
            icon: Edit,
            variant: 'secondary',
          },
          {
            label: isActive ? 'Desactivar' : 'Activar',
            onClick: () => setShowDeactivateDialog(true),
            icon: isActive ? UserX : UserCheck,
            variant: isActive ? 'danger' : 'primary',
          },
        ]}
      />

      <div className="space-y-6">
        {/* Rol Badge */}
        <div className="flex items-center gap-2">
          <span className={cn('px-3 py-1.5 rounded-full text-sm font-medium', roleInfo.bg, roleInfo.color)}>
            <Shield className="w-4 h-4 inline-block mr-1" />
            {roleInfo.label}
          </span>
        </div>

        {/* Informacion de Contacto */}
        <DetailSection title="Informacion de Contacto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Telefono</p>
                <p className="text-sm font-medium text-gray-900">{user.phone || 'No registrado'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Verificacion Email</p>
                <p className="text-sm font-medium text-gray-900">
                  {user.emailVerified ? 'Verificado' : 'Pendiente'}
                </p>
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Informacion de la Cuenta */}
        <DetailSection title="Informacion de la Cuenta">
          <DetailGrid cols={2}>
            <DetailItem label="Nombre Completo" value={userName} />
            <DetailItem label="Rol" value={roleInfo.label} />
            {user.firstName && <DetailItem label="Nombre" value={user.firstName} />}
            {user.lastName && <DetailItem label="Apellido" value={user.lastName} />}
          </DetailGrid>
        </DetailSection>

        {/* Actividad */}
        <DetailSection title="Actividad">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Ultimo Acceso</p>
                <p className="text-sm font-medium text-gray-900">
                  {user.lastLogin ? formatTimeAgo(user.lastLogin) : 'Nunca'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-gray-200 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Fecha de Registro</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Seguridad */}
        {(user.failedLoginAttempts > 0 || user.accountLockedUntil) && (
          <DetailSection title="Seguridad">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Intentos de acceso fallidos: {user.failedLoginAttempts}
                  </p>
                  {user.accountLockedUntil && user.accountLockedUntil > Date.now() && (
                    <p className="text-sm text-amber-700 mt-1">
                      Cuenta bloqueada hasta: {formatDate(user.accountLockedUntil)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </DetailSection>
        )}

        {/* Metadata */}
        <div className="text-xs text-gray-400 text-right">
          ID: {user._id}
        </div>
      </div>

      {/* Activate/Deactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeactivateDialog}
        onClose={() => setShowDeactivateDialog(false)}
        onConfirm={handleToggleActive}
        title={isActive ? 'Desactivar Usuario' : 'Activar Usuario'}
        message={
          isActive
            ? `¿Estas seguro de que deseas desactivar a ${userName}? El usuario no podra acceder al sistema.`
            : `¿Estas seguro de que deseas activar a ${userName}? El usuario podra acceder al sistema nuevamente.`
        }
        confirmLabel={isActive ? 'Desactivar' : 'Activar'}
        variant={isActive ? 'danger' : 'info'}
        isLoading={isProcessing}
      />
    </div>
  );
}
