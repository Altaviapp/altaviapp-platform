'use client';

/**
 * DriverProfileSection - Driver-specific profile fields
 *
 * Displays and allows editing of:
 * - License number
 * - License type
 * - License expiry date
 */

import { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, Check, X, Edit2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DriverProfileSectionProps {
  licenseNumber?: string;
  licenseType?: string;
  licenseExpiry?: number; // timestamp
  onSave: (data: {
    licenseNumber?: string;
    licenseType?: string;
    licenseExpiry?: number;
  }) => Promise<void>;
  isLoading?: boolean;
}

const LICENSE_TYPES = [
  { value: 'A', label: 'Tipo A - Motocicletas' },
  { value: 'B', label: 'Tipo B - Vehículos livianos' },
  { value: 'C', label: 'Tipo C - Taxis y camionetas' },
  { value: 'D', label: 'Tipo D - Buses y busetas' },
  { value: 'E', label: 'Tipo E - Camiones y tractomulas' },
  { value: 'F', label: 'Tipo F - Especiales' },
  { value: 'G', label: 'Tipo G - Maquinaria' },
];

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

export function DriverProfileSection({
  licenseNumber,
  licenseType,
  licenseExpiry,
  onSave,
  isLoading = false,
}: DriverProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    licenseNumber: licenseNumber || '',
    licenseType: licenseType || '',
    licenseExpiryDate: licenseExpiry ? formatDateForInput(licenseExpiry) : '',
  });

  // Reset form when props change
  useEffect(() => {
    setFormData({
      licenseNumber: licenseNumber || '',
      licenseType: licenseType || '',
      licenseExpiryDate: licenseExpiry ? formatDateForInput(licenseExpiry) : '',
    });
  }, [licenseNumber, licenseType, licenseExpiry]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        licenseNumber: formData.licenseNumber || undefined,
        licenseType: formData.licenseType || undefined,
        licenseExpiry: formData.licenseExpiryDate
          ? new Date(formData.licenseExpiryDate).getTime()
          : undefined,
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
      licenseNumber: licenseNumber || '',
      licenseType: licenseType || '',
      licenseExpiryDate: licenseExpiry ? formatDateForInput(licenseExpiry) : '',
    });
    setIsEditing(false);
    setError(null);
  };

  const isProfileComplete = !!(licenseNumber && licenseType && licenseExpiry);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Licencia de Conducir
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
              Número de licencia
            </label>
            <input
              type="text"
              value={formData.licenseNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
              placeholder="Ej: EC-1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de licencia
            </label>
            <select
              value={formData.licenseType}
              onChange={(e) => setFormData(prev => ({ ...prev, licenseType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors bg-white"
            >
              <option value="">Seleccionar tipo</option>
              {LICENSE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Para transporte escolar se requiere Tipo D o superior
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de vencimiento
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.licenseExpiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, licenseExpiryDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500">Número de licencia</p>
            <p className={cn(
              'text-sm font-medium',
              licenseNumber ? 'text-gray-900' : 'text-gray-400 italic'
            )}>
              {licenseNumber || 'No configurado'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Tipo de licencia</p>
            <p className={cn(
              'text-sm font-medium',
              licenseType ? 'text-gray-900' : 'text-gray-400 italic'
            )}>
              {licenseType
                ? LICENSE_TYPES.find(t => t.value === licenseType)?.label || licenseType
                : 'No configurado'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Vencimiento</p>
            {licenseExpiry ? (
              <div className="flex items-center gap-2">
                <p className={cn(
                  'text-sm font-medium',
                  isExpired(licenseExpiry)
                    ? 'text-error'
                    : isExpiringSoon(licenseExpiry)
                    ? 'text-warning'
                    : 'text-gray-900'
                )}>
                  {formatDate(licenseExpiry)}
                </p>
                {isExpired(licenseExpiry) && (
                  <span className="px-2 py-0.5 bg-error/10 text-error text-xs rounded-full font-medium">
                    Vencida
                  </span>
                )}
                {isExpiringSoon(licenseExpiry) && !isExpired(licenseExpiry) && (
                  <span className="px-2 py-0.5 bg-warning/10 text-warning text-xs rounded-full font-medium">
                    Por vencer
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm font-medium text-gray-400 italic">No configurado</p>
            )}
          </div>

          {!isProfileComplete && (
            <div className="mt-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-sm text-warning flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Completa tu información de licencia
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
