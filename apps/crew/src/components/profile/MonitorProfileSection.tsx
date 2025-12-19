'use client';

/**
 * MonitorProfileSection - Monitor-specific profile fields
 *
 * Displays and allows editing of:
 * - Cédula (ID number)
 * - First aid certification
 * - Child care certification
 */

import { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, Check, X, Edit2, Calendar, Shield, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonitorProfileSectionProps {
  idNumber?: string;
  firstAidCertified?: boolean;
  firstAidCertExpiry?: number; // timestamp
  childCareCertified?: boolean;
  onSave: (data: {
    idNumber?: string;
    firstAidCertified?: boolean;
    firstAidCertExpiry?: number;
    childCareCertified?: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateForInput(timestamp: number | undefined): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0] ?? '';
}

function isExpiringSoon(timestamp: number): boolean {
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return timestamp - now < thirtyDays && timestamp > now;
}

function isExpired(timestamp: number): boolean {
  return timestamp < Date.now();
}

export function MonitorProfileSection({
  idNumber,
  firstAidCertified,
  firstAidCertExpiry,
  childCareCertified,
  onSave,
  isLoading = false,
}: MonitorProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    idNumber: idNumber || '',
    firstAidCertified: firstAidCertified || false,
    firstAidCertExpiryDate: firstAidCertExpiry ? formatDateForInput(firstAidCertExpiry) : '',
    childCareCertified: childCareCertified || false,
  });

  // Reset form when props change
  useEffect(() => {
    setFormData({
      idNumber: idNumber || '',
      firstAidCertified: firstAidCertified || false,
      firstAidCertExpiryDate: firstAidCertExpiry ? formatDateForInput(firstAidCertExpiry) : '',
      childCareCertified: childCareCertified || false,
    });
  }, [idNumber, firstAidCertified, firstAidCertExpiry, childCareCertified]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        idNumber: formData.idNumber || undefined,
        firstAidCertified: formData.firstAidCertified,
        firstAidCertExpiry: formData.firstAidCertExpiryDate
          ? new Date(formData.firstAidCertExpiryDate).getTime()
          : undefined,
        childCareCertified: formData.childCareCertified,
      });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      idNumber: idNumber || '',
      firstAidCertified: firstAidCertified || false,
      firstAidCertExpiryDate: firstAidCertExpiry ? formatDateForInput(firstAidCertExpiry) : '',
      childCareCertified: childCareCertified || false,
    });
    setIsEditing(false);
    setError(null);
  };

  const isProfileComplete = !!idNumber;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Identificación y Certificados
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Edit2 className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de cédula
            </label>
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
              placeholder="Ej: 1234567890"
              maxLength={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">10 dígitos sin guiones</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Certificaciones</p>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.firstAidCertified}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstAidCertified: e.target.checked }))}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <Heart className="w-5 h-5 text-error" />
                <span className="text-sm text-gray-900">Primeros auxilios</span>
              </label>

              {formData.firstAidCertified && (
                <div className="ml-10">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Fecha de vencimiento del certificado
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.firstAidCertExpiryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstAidCertExpiryDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.childCareCertified}
                  onChange={(e) => setFormData(prev => ({ ...prev, childCareCertified: e.target.checked }))}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <Shield className="w-5 h-5 text-info" />
                <span className="text-sm text-gray-900">Cuidado infantil</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                'flex-1 px-4 py-2 rounded-lg text-white transition-colors flex items-center justify-center gap-2',
                isSaving ? 'bg-primary/70' : 'bg-primary hover:bg-primary/90'
              )}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500">Cédula</p>
            <p className={cn(
              'text-sm font-medium',
              idNumber ? 'text-gray-900' : 'text-gray-400 italic'
            )}>
              {idNumber || 'No configurado'}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-500 mb-2">Certificaciones</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center',
                  firstAidCertified ? 'bg-success/10' : 'bg-gray-100'
                )}>
                  {firstAidCertified ? (
                    <Check className="w-3 h-3 text-success" />
                  ) : (
                    <X className="w-3 h-3 text-gray-400" />
                  )}
                </div>
                <span className={cn(
                  'text-sm',
                  firstAidCertified ? 'text-gray-900' : 'text-gray-400'
                )}>
                  Primeros auxilios
                </span>
                {firstAidCertified && firstAidCertExpiry && (
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    isExpired(firstAidCertExpiry)
                      ? 'bg-error/10 text-error'
                      : isExpiringSoon(firstAidCertExpiry)
                      ? 'bg-warning/10 text-warning'
                      : 'bg-gray-100 text-gray-600'
                  )}>
                    {isExpired(firstAidCertExpiry)
                      ? 'Vencido'
                      : `Vence: ${formatDate(firstAidCertExpiry)}`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center',
                  childCareCertified ? 'bg-success/10' : 'bg-gray-100'
                )}>
                  {childCareCertified ? (
                    <Check className="w-3 h-3 text-success" />
                  ) : (
                    <X className="w-3 h-3 text-gray-400" />
                  )}
                </div>
                <span className={cn(
                  'text-sm',
                  childCareCertified ? 'text-gray-900' : 'text-gray-400'
                )}>
                  Cuidado infantil
                </span>
              </div>
            </div>
          </div>

          {!isProfileComplete && (
            <div className="mt-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-sm text-warning flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Completa tu número de cédula
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
