'use client';

/**
 * GlobalProfileSection - Shared profile fields for all crew members
 *
 * Displays and allows editing of:
 * - Phone number
 * - Emergency contact
 */

import { useState, useEffect } from 'react';
import { Phone, AlertCircle, Check, X, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlobalProfileSectionProps {
  phone?: string;
  emergencyContact?: string;
  onSave: (data: { phone?: string; emergencyContact?: string }) => Promise<void>;
  isLoading?: boolean;
}

export function GlobalProfileSection({
  phone,
  emergencyContact,
  onSave,
  isLoading = false,
}: GlobalProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    phone: phone || '',
    emergencyContact: emergencyContact || '',
  });

  // Reset form when props change
  useEffect(() => {
    setFormData({
      phone: phone || '',
      emergencyContact: emergencyContact || '',
    });
  }, [phone, emergencyContact]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        phone: formData.phone || undefined,
        emergencyContact: formData.emergencyContact || undefined,
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
      phone: phone || '',
      emergencyContact: emergencyContact || '',
    });
    setIsEditing(false);
    setError(null);
  };

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
          <Phone className="w-5 h-5 text-primary" />
          Contacto
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
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+593XXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">Formato Ecuador: +593XXXXXXXXX</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contacto de emergencia
            </label>
            <input
              type="tel"
              value={formData.emergencyContact}
              onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
              placeholder="+593XXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">Número de un familiar o amigo cercano</p>
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
            <p className="text-xs text-gray-500">Teléfono</p>
            <p className={cn(
              'text-sm font-medium',
              phone ? 'text-gray-900' : 'text-gray-400 italic'
            )}>
              {phone || 'No configurado'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Contacto de emergencia</p>
            <p className={cn(
              'text-sm font-medium',
              emergencyContact ? 'text-gray-900' : 'text-gray-400 italic'
            )}>
              {emergencyContact || 'No configurado'}
            </p>
          </div>

          {(!phone || !emergencyContact) && (
            <div className="mt-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-sm text-warning flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Completa tu información de contacto
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
