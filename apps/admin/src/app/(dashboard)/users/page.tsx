'use client';

import { useState, useMemo } from 'react';
import { Users, Mail, Shield, UserCheck, Car, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/core';
import { PageHeader, SearchFilter, DataTable, StatsGrid, type Column, type StatItem } from '@/components/shared';
import { InviteUserModal } from '@/components/users/InviteUserModal';
import { useUsers, useUserStats } from '@/hooks';
import { getInitials, formatTimeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/hooks';

/**
 * Users Page
 *
 * Manages all users in the institution.
 * Features: search, role filter, invite modal.
 *
 * PRD Reference: Users Module
 */

const ROLE_CONFIG: Record<string, { label: string; variant: 'danger' | 'purple' | 'info' | 'success' | 'warning' }> = {
  super_admin: { label: 'Super Admin', variant: 'danger' },
  admin: { label: 'Administrador', variant: 'purple' },
  driver: { label: 'Conductor', variant: 'info' },
  monitor: { label: 'Monitor', variant: 'success' },
  parent: { label: 'Padre', variant: 'warning' },
};

const ROLE_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'admin', label: 'Administradores' },
  { value: 'driver', label: 'Conductores' },
  { value: 'monitor', label: 'Monitores' },
  { value: 'parent', label: 'Padres' },
];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Real data from Convex
  const { users, isLoading, isEmpty } = useUsers(
    roleFilter ? { role: roleFilter as UserRole } : undefined
  );
  const { stats, isLoading: statsLoading } = useUserStats();

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        !searchQuery ||
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    });
  }, [users, searchQuery]);

  // Stats
  const statItems: StatItem[] = useMemo(() => [
    { label: 'Total Usuarios', value: stats.total, icon: Users, color: 'default' },
    { label: 'Administradores', value: stats.admins, icon: Shield, color: 'purple' as any },
    { label: 'Conductores', value: stats.drivers, icon: Car, color: 'info' },
    { label: 'Padres', value: stats.parents, icon: GraduationCap, color: 'warning' },
  ], [stats]);

  // Table columns
  const columns: Column<(typeof users)[0]>[] = [
    {
      key: 'name',
      header: 'Usuario',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium text-sm">
              {getInitials(user.name?.split(' ')[0] || '', user.name?.split(' ')[1] || '')}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name || 'Sin nombre'}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rol',
      render: (user) => {
        const roleInfo = ROLE_CONFIG[user.role] ?? { label: user.role, variant: 'default' as const };
        return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
      },
    },
    {
      key: 'status',
      header: 'Estado',
      render: (user) => (
        <Badge variant={user.isActive !== false ? 'success' : 'default'}>
          {user.isActive !== false ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Último Acceso',
      render: (user) => (
        <span className="text-gray-500 text-sm">
          {user.lastLogin ? formatTimeAgo(user.lastLogin) : 'Nunca'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Gestión de Usuarios"
        subtitle="Administra los usuarios de tu institución"
        actions={[
          {
            label: 'Invitar Usuario',
            icon: Mail,
            variant: 'primary',
            onClick: () => setIsInviteModalOpen(true),
          },
        ]}
      />

      {/* Stats */}
      <StatsGrid stats={statItems} isLoading={isLoading || statsLoading} columns={4} />

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <SearchFilter
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Buscar por nombre o email..."
            filters={[
              {
                key: 'role',
                label: 'Todos los roles',
                value: roleFilter,
                options: [
                  { value: 'admin', label: 'Administradores' },
                  { value: 'driver', label: 'Conductores' },
                  { value: 'monitor', label: 'Monitores' },
                  { value: 'parent', label: 'Padres' },
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === 'role') setRoleFilter(value);
            }}
            className="flex-1"
          />

          {/* Quick Role Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {ROLE_FILTERS.map((role) => (
              <button
                key={role.value}
                onClick={() => setRoleFilter(role.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                  roleFilter === role.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        isLoading={isLoading}
        keyExtractor={(u) => u._id}
        rowHref={(u) => `/users/${u._id}`}
        emptyState={{
          icon: Users,
          title: isEmpty ? 'No hay usuarios' : 'Sin resultados',
          description: isEmpty
            ? 'Invita usuarios a tu institución'
            : 'No se encontraron usuarios con ese criterio',
          action: isEmpty
            ? { label: 'Invitar Usuario', onClick: () => setIsInviteModalOpen(true) }
            : undefined,
        }}
      />

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
