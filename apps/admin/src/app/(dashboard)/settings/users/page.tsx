'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users, Plus, Search, Edit, Trash2, MoreHorizontal,
  Shield, ChevronLeft, ChevronRight, Mail, Phone, CheckCircle, XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader, ConfirmDialog } from '@/components/shared';

// Mock users data
const mockUsers = [
  {
    id: '1',
    name: 'Admin Principal',
    email: 'admin@escuela-altaviapp.ec',
    phone: '+593 99 111 2222',
    role: 'admin',
    status: 'active',
    lastLogin: '04/12/2024 08:30',
    createdAt: '01/01/2024',
  },
  {
    id: '2',
    name: 'Juan Pérez',
    email: 'juan.perez@escuela-altaviapp.ec',
    phone: '+593 99 123 4567',
    role: 'driver',
    status: 'active',
    lastLogin: '04/12/2024 06:45',
    createdAt: '15/01/2024',
  },
  {
    id: '3',
    name: 'María González',
    email: 'maria.gonzalez@escuela-altaviapp.ec',
    phone: '+593 97 111 2222',
    role: 'driver',
    status: 'active',
    lastLogin: '04/12/2024 06:30',
    createdAt: '15/01/2024',
  },
  {
    id: '4',
    name: 'Ana Torres',
    email: 'ana.torres@escuela-altaviapp.ec',
    phone: '+593 98 765 4321',
    role: 'monitor',
    status: 'active',
    lastLogin: '04/12/2024 06:50',
    createdAt: '20/01/2024',
  },
  {
    id: '5',
    name: 'Carlos Ruiz',
    email: 'carlos.ruiz@escuela-altaviapp.ec',
    phone: '+593 95 555 6666',
    role: 'driver',
    status: 'inactive',
    lastLogin: '01/11/2024 14:20',
    createdAt: '01/02/2024',
  },
  {
    id: '6',
    name: 'Pedro Gómez',
    email: 'pedro.gomez@gmail.com',
    phone: '+593 97 333 4444',
    role: 'parent',
    status: 'active',
    lastLogin: '03/12/2024 19:45',
    createdAt: '10/02/2024',
  },
  {
    id: '7',
    name: 'Laura Sánchez',
    email: 'laura.sanchez@escuela-altaviapp.ec',
    phone: '+593 96 333 4444',
    role: 'monitor',
    status: 'active',
    lastLogin: '04/12/2024 06:40',
    createdAt: '15/02/2024',
  },
];

const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: 'Administrador', color: 'text-purple-700', bg: 'bg-purple-100' },
  driver: { label: 'Conductor', color: 'text-blue-700', bg: 'bg-blue-100' },
  monitor: { label: 'Monitor', color: 'text-green-700', bg: 'bg-green-100' },
  parent: { label: 'Padre', color: 'text-amber-700', bg: 'bg-amber-100' },
};

/**
 * Users Management Page
 * Manage system users and their roles
 */
export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: mockUsers.length,
    admins: mockUsers.filter((u) => u.role === 'admin').length,
    drivers: mockUsers.filter((u) => u.role === 'driver').length,
    monitors: mockUsers.filter((u) => u.role === 'monitor').length,
    parents: mockUsers.filter((u) => u.role === 'parent').length,
    active: mockUsers.filter((u) => u.status === 'active').length,
  };

  const handleDeleteClick = (userId: string) => {
    setSelectedUser(userId);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setShowDeleteDialog(false);
    setSelectedUser(null);
    setIsDeleting(false);
  };

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
            label: 'Nuevo Usuario',
            href: '/settings/users/new',
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
                    Último Acceso
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const defaultRole = { label: 'Usuario', color: 'text-gray-700', bg: 'bg-gray-100' };
                  const role = roleConfig[user.role] ?? defaultRole;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-primary">
                              {user.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">ID: {user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', role.bg, role.color)}>
                          {role.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {user.status === 'active' ? (
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
                      <td className="px-4 py-3 text-sm text-gray-600">{user.lastLogin}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/settings/users/${user.id}/edit`}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(user.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Usuario"
        message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
