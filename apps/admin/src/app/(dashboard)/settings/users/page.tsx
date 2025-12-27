'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Plus, Search,
  Shield, ChevronLeft, ChevronRight, Mail, Phone, CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared';
import { useUsers, useUserStats } from '@/hooks';

const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
  super_admin: { label: 'Super Admin', color: 'text-red-700', bg: 'bg-red-100' },
  admin: { label: 'Administrador', color: 'text-purple-700', bg: 'bg-purple-100' },
  driver: { label: 'Conductor', color: 'text-blue-700', bg: 'bg-blue-100' },
  monitor: { label: 'Monitor', color: 'text-green-700', bg: 'bg-green-100' },
  parent: { label: 'Padre', color: 'text-amber-700', bg: 'bg-amber-100' },
};

/**
 * Users Management Page
 * Connected to real Convex data
 */
export default function UsersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Real data from Convex
  const { users, isLoading } = useUsers();
  const { stats } = useUserStats();

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  return (
    <div>
      <PageHeader
        title="Gestión de Usuarios"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Configuración', href: '/settings' },
          { label: 'Usuarios' },
        ]}
        backHref="/settings"
        actions={[
          {
            label: 'Invitar Usuario',
            href: '/settings/invitations/new',
            icon: Plus,
            variant: 'primary',
          },
        ]}
      />

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stats.admins}</p>
                <p className="text-xs text-gray-500">Admins</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stats.drivers}</p>
                <p className="text-xs text-gray-500">Conductores</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stats.monitors}</p>
                <p className="text-xs text-gray-500">Monitores</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stats.parents}</p>
                <p className="text-xs text-gray-500">Padres</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-xs text-gray-500">Activos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'admin', label: 'Admins' },
                { value: 'driver', label: 'Conductores' },
                { value: 'monitor', label: 'Monitores' },
                { value: 'parent', label: 'Padres' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRoleFilter(option.value)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                    roleFilter === option.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-gray-500">Cargando usuarios...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sin resultados</h3>
              <p className="text-gray-500">No se encontraron usuarios con los filtros actuales</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Usuario
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Contacto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Rol
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Registro
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => {
                      const defaultRole = { label: 'Usuario', color: 'text-gray-700', bg: 'bg-gray-100' };
                      const role = roleConfig[user.role] ?? defaultRole;
                      const isActive = user.isActive !== false;
                      return (
                        <tr
                          key={user._id}
                          onClick={() => router.push(`/settings/users/${user._id}`)}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-primary">
                                  {(user.name || user.email)
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{user.name || 'Sin nombre'}</p>
                                <p className="text-xs text-gray-500">ID: {user._id.slice(-8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Phone className="w-3 h-3" />
                                  {user.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('px-2 py-1 rounded-full text-xs font-medium', role.bg, role.color)}>
                              {role.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {isActive ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-green-600">Activo</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-500">Inactivo</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-EC') : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Mostrando 1-{filteredUsers.length} de {filteredUsers.length} usuarios
                </p>
                <div className="flex gap-2">
                  <button
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    disabled
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-4 py-2 text-sm">Página 1 de 1</span>
                  <button
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    disabled
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
