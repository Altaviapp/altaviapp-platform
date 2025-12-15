'use client';

import { useState } from 'react';
import { Users, Search, MoreHorizontal, Edit, Trash2, Eye, Mail, Shield, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InviteUserModal } from '@/components/users/InviteUserModal';
import { useUsers, useUserStats, useUserMutations } from '@/hooks';
import type { UserRole } from '@/hooks';

const roleLabels: Record<string, { label: string; color: string }> = {
  super_admin: { label: 'Super Admin', color: 'bg-red-100 text-red-700' },
  admin: { label: 'Administrador', color: 'bg-purple-100 text-purple-700' },
  driver: { label: 'Conductor', color: 'bg-blue-100 text-blue-700' },
  monitor: { label: 'Monitor', color: 'bg-green-100 text-green-700' },
  parent: { label: 'Padre', color: 'bg-orange-100 text-orange-700' },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: 'Activo', color: 'bg-success text-white' },
  pending: { label: 'Pendiente', color: 'bg-warning text-white' },
  inactive: { label: 'Inactivo', color: 'bg-gray-400 text-white' },
};

function formatLastLogin(timestamp: number | undefined): string {
  if (!timestamp) return 'Nunca';

  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Hace un momento';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
  return new Date(timestamp).toLocaleDateString('es-EC');
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Real data from Convex
  const { users, isLoading } = useUsers(roleFilter !== 'all' ? { role: roleFilter } : undefined);
  const { stats, isLoading: statsLoading } = useUserStats();
  const { deactivateUser, reactivateUser } = useUserMutations();

  // Filter users by search query
  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await deactivateUser(userId as any);
      } else {
        await reactivateUser(userId as any);
      }
      setOpenMenu(null);
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const statCards = [
    { label: 'Total Usuarios', value: stats.total, color: 'bg-primary' },
    { label: 'Administradores', value: stats.admins, color: 'bg-purple-500' },
    { label: 'Conductores', value: stats.drivers, color: 'bg-blue-500' },
    { label: 'Padres', value: stats.parents, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-500">Administra los usuarios de tu institución</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Mail className="w-5 h-5" />
            Invitar Usuario
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', stat.color)}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stat.value}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {(['all', 'admin', 'driver', 'monitor', 'parent'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  roleFilter === role
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {role === 'all' ? 'Todos' : roleLabels[role]?.label || role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-500">Cargando usuarios...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay usuarios</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'No se encontraron usuarios con ese criterio' : 'Invita usuarios a tu institución'}
            </p>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Mail className="w-5 h-5" />
              Invitar Usuario
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Usuario</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rol</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Último Acceso</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const role = roleLabels[user.role] || { label: user.role, color: 'bg-gray-100 text-gray-700' };
                    const isActive = user.isActive !== false;
                    const status = statusLabels[isActive ? 'active' : 'inactive'] || { label: 'Desconocido', color: 'bg-gray-400 text-white' };
                    const initials = user.name
                      ?.split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || '?';

                    return (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-medium">{initials}</span>
                            </div>
                            <span className="font-medium text-gray-900">{user.name || 'Sin nombre'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={cn('px-2 py-1 text-xs rounded-full', role.color)}>
                            {role.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('px-2 py-1 text-xs rounded-full', status.color)}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-sm">
                          {formatLastLogin(user.lastLogin)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenu(openMenu === user._id ? null : user._id)}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <MoreHorizontal className="w-5 h-5 text-gray-500" />
                            </button>
                            {openMenu === user._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                  <Eye className="w-4 h-4" /> Ver perfil
                                </button>
                                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                  <Edit className="w-4 h-4" /> Editar
                                </button>
                                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                  <Shield className="w-4 h-4" /> Cambiar rol
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(user._id, isActive)}
                                  className={cn(
                                    'w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2',
                                    isActive ? 'text-error' : 'text-success'
                                  )}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  {isActive ? 'Desactivar' : 'Reactivar'}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Mostrando {filteredUsers.length} de {users.length} usuarios
              </p>
              <div className="flex gap-2">
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm">Página 1</span>
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Invite User Modal */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => {
          setIsInviteModalOpen(false);
        }}
      />
    </div>
  );
}
