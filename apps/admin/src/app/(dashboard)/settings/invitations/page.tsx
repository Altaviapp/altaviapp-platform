'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Search,
  Copy,
  Download,
  Check,
  Loader2,
} from 'lucide-react';
import { useInvitations, useInvitationStats } from '@/hooks';
import type { InvitationStatus } from '@/hooks';

// ============================================
// HELPERS
// ============================================

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    parent: 'Padre',
    driver: 'Conductor',
    monitor: 'Auxiliar',
    admin: 'Admin',
  };
  return labels[role] || role;
};

const getStatusConfig = (status: string) => {
  const configs: Record<string, { label: string; color: string; dot: string }> = {
    pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
    accepted: { label: 'Aceptada', color: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
    expired: { label: 'Expirada', color: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
    cancelled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-800', dot: 'bg-gray-500' },
  };
  return configs[status] || configs.pending;
};

const getDaysUntilExpiry = (expiresAt: number) => {
  const now = Date.now();
  const diffMs = expiresAt - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
};

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * Invitations Page
 * Connected to real Convex data
 */
export default function InvitationsPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvitationStatus | 'all'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Real data from Convex
  const { invitations, isLoading } = useInvitations();
  const { stats } = useInvitationStats();

  // Filter invitations
  const filteredInvitations = useMemo(() => {
    return invitations.filter((inv) => {
      const matchesSearch = inv.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.firstName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (inv.lastName?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invitations, searchQuery, statusFilter]);

  // Copy code to clipboard
  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/settings')}
          className="text-gray-600 hover:text-primary transition-colors inline-flex items-center gap-1 text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Configuración
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invitaciones</h1>
            <p className="text-gray-600 text-sm mt-1">
              Gestiona las invitaciones para nuevos usuarios
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/settings/invitations/import')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Importar CSV
            </button>
            <button
              onClick={() => router.push('/settings/invitations/new')}
              className="bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nueva Invitación
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-sm text-yellow-800">Pendientes</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-green-800">Aceptadas</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.accepted}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm text-red-800">Expiradas</span>
          </div>
          <p className="text-2xl font-bold text-red-900 mt-1">{stats.expired}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-500" />
            <span className="text-sm text-gray-800">Canceladas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InvitationStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors bg-white"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="accepted">Aceptadas</option>
            <option value="expired">Expiradas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-gray-500">Cargando invitaciones...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Expira
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Código
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvitations.map((invitation) => {
                    const statusConfig = getStatusConfig(invitation.status) ?? { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' };
                    const daysUntilExpiry = invitation.expiresAt ? getDaysUntilExpiry(invitation.expiresAt) : 0;
                    const invName = [invitation.firstName, invitation.lastName].filter(Boolean).join(' ');

                    return (
                      <tr key={invitation.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{invitation.email}</p>
                            {invName && (
                              <p className="text-sm text-gray-500">{invName}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-700">
                            {getRoleLabel(invitation.role)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {invitation.status === 'pending' ? (
                            <span className="text-sm text-gray-700">
                              {daysUntilExpiry > 0 ? `${daysUntilExpiry} días` : 'Hoy'}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                              {invitation.invitationCode}
                            </code>
                            <button
                              onClick={() => handleCopyCode(invitation.invitationCode)}
                              className="text-gray-400 hover:text-primary transition-colors"
                              title="Copiar código"
                            >
                              {copiedCode === invitation.invitationCode ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredInvitations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <p className="text-gray-500">No se encontraron invitaciones</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando 1-{filteredInvitations.length} de {invitations.length} invitaciones
              </p>
              <div className="flex gap-2">
                <button
                  disabled
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg text-gray-400 cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  disabled
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg text-gray-400 cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
