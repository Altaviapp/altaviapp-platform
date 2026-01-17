'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Save,
  UserMinus,
  Stethoscope,
  Car,
  UserCheck,
  MapPin,
  MapPinned,
  Clock,
  AlarmClock,
  Home,
  Calendar,
  Route,
  Ban,
  Bell,
  AlertTriangle,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useNovedadTypeMutations,
  NEW_CATEGORY_LABELS,
  DURATION_LABELS,
  COLOR_OPTIONS,
  ICON_OPTIONS,
} from '@/hooks';
import type { NovedadTypeFormData, NovedadTypeCategory, NovedadTypeDuration } from '@/hooks';
import type { Id } from '../../../../../convex/_generated/dataModel';

// Icon mapping for picker
const ICONS: Record<string, React.ElementType> = {
  UserMinus,
  Stethoscope,
  Car,
  UserCheck,
  MapPin,
  MapPinned,
  Clock,
  AlarmClock,
  Home,
  Calendar,
  Route,
  Ban,
  Bell,
  AlertTriangle,
  FileText,
};

interface NovedadTypeFormProps {
  initialData?: Partial<NovedadTypeFormData> & { _id?: Id<"novedadTypes">; isSystemType?: boolean };
  mode: 'create' | 'edit';
}

const defaultFormData: NovedadTypeFormData = {
  name: '',
  description: '',
  icon: 'FileText',
  color: 'gray',
  category: 'absence', // Default to absence (most common)
  durationType: 'single_day',
  requiresApproval: true,
  affectsTrips: true,
  affectsRouteCalculation: false,
  evidenceRequired: false,
  evidenceOptional: true,
  maxEvidenceFiles: 5,
  allowedFileTypes: ['image/*', 'application/pdf'],
  minAdvanceHours: 2,
  reasonRequired: true,
};

export function NovedadTypeForm({ initialData, mode }: NovedadTypeFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<NovedadTypeFormData>({
    ...defaultFormData,
    ...initialData,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { createType, updateType } = useNovedadTypeMutations();

  const isSystemType = initialData?.isSystemType ?? false;

  const handleChange = <K extends keyof NovedadTypeFormData>(
    key: K,
    value: NovedadTypeFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (!formData.description.trim()) {
      setError('La descripción es requerida');
      return;
    }

    setIsSaving(true);

    try {
      if (mode === 'create') {
        await createType(formData);
        setSuccess(true);
        setTimeout(() => {
          router.push('/settings/novedades');
        }, 1500);
      } else if (initialData?._id) {
        await updateType(initialData._id, formData);
        setSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
          <p className="text-sm text-success">
            {mode === 'create' ? 'Tipo creado correctamente' : 'Cambios guardados'}
          </p>
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ausencia, Recoge por Tercero, etc."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción <span className="text-error">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={2}
            placeholder="Texto de ayuda que verán los padres al seleccionar este tipo"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>
      </div>

      {/* Visual */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Apariencia</h3>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Icon Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icono</label>
            <div className="grid grid-cols-5 gap-2">
              {ICON_OPTIONS.map((iconOpt) => {
                const Icon = ICONS[iconOpt.value] ?? FileText;
                return (
                  <button
                    key={iconOpt.value}
                    type="button"
                    onClick={() => handleChange('icon', iconOpt.value)}
                    className={cn(
                      'p-2 rounded-lg border-2 transition-colors',
                      formData.icon === iconOpt.value
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                    title={iconOpt.label}
                  >
                    <Icon className="w-5 h-5 text-gray-600 mx-auto" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((colorOpt) => (
                <button
                  key={colorOpt.value}
                  type="button"
                  onClick={() => handleChange('color', colorOpt.value)}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-colors flex items-center gap-2',
                    formData.color === colorOpt.value
                      ? 'border-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <span className={cn('w-4 h-4 rounded-full', colorOpt.className)} />
                  <span className="text-xs text-gray-600">{colorOpt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-2">Vista Previa</p>
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
            {(() => {
              const Icon = ICONS[formData.icon] || FileText;
              const colorClass = {
                red: { bg: 'bg-red-100', text: 'text-red-600' },
                blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
                green: { bg: 'bg-green-100', text: 'text-green-600' },
                yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
                purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
                orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
                indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
                gray: { bg: 'bg-gray-100', text: 'text-gray-600' },
              }[formData.color] || { bg: 'bg-gray-100', text: 'text-gray-600' };
              return (
                <>
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colorClass.bg)}>
                    <Icon className={cn('w-5 h-5', colorClass.text)} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{formData.name || 'Nombre del tipo'}</p>
                    <p className="text-sm text-gray-500">{formData.description || 'Descripción'}</p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Category & Duration */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Clasificación</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Category - Only show new simplified categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value as NovedadTypeCategory)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {Object.entries(NEW_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Duration Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Duración</label>
            <select
              value={formData.durationType}
              onChange={(e) => handleChange('durationType', e.target.value as NovedadTypeDuration)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {Object.entries(DURATION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Workflow Options */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Flujo de Trabajo</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.requiresApproval}
              onChange={(e) => handleChange('requiresApproval', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div>
              <p className="font-medium text-gray-900">Requiere Aprobación</p>
              <p className="text-sm text-gray-500">Admin debe aprobar antes de aplicar</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.affectsTrips}
              onChange={(e) => handleChange('affectsTrips', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div>
              <p className="font-medium text-gray-900">Afecta Viajes</p>
              <p className="text-sm text-gray-500">Se aplica a viajes programados</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.affectsRouteCalculation}
              onChange={(e) => handleChange('affectsRouteCalculation', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div>
              <p className="font-medium text-gray-900">Recalcula Ruta</p>
              <p className="text-sm text-gray-500">Permite optimizar ruta sin este estudiante</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.reasonRequired}
              onChange={(e) => handleChange('reasonRequired', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div>
              <p className="font-medium text-gray-900">Razón Requerida</p>
              <p className="text-sm text-gray-500">Padre debe explicar el motivo</p>
            </div>
          </label>
        </div>

        {/* Min Advance Hours */}
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Anticipación Mínima (horas)
          </label>
          <input
            type="number"
            min="0"
            value={formData.minAdvanceHours || 0}
            onChange={(e) => handleChange('minAdvanceHours', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <p className="text-xs text-gray-400 mt-1">0 = sin mínimo</p>
        </div>
      </div>

      {/* Evidence Options */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Evidencia / Adjuntos</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.evidenceRequired}
              onChange={(e) => {
                handleChange('evidenceRequired', e.target.checked);
                if (e.target.checked) {
                  handleChange('evidenceOptional', false);
                }
              }}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div>
              <p className="font-medium text-gray-900">Evidencia Requerida</p>
              <p className="text-sm text-gray-500">Padre debe adjuntar archivo</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.evidenceOptional}
              onChange={(e) => {
                handleChange('evidenceOptional', e.target.checked);
                if (e.target.checked) {
                  handleChange('evidenceRequired', false);
                }
              }}
              disabled={formData.evidenceRequired}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
            />
            <div>
              <p className="font-medium text-gray-900">Evidencia Opcional</p>
              <p className="text-sm text-gray-500">Puede adjuntar archivo si quiere</p>
            </div>
          </label>
        </div>

        {(formData.evidenceRequired || formData.evidenceOptional) && (
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Máximo de Archivos
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.maxEvidenceFiles || 5}
              onChange={(e) => handleChange('maxEvidenceFiles', parseInt(e.target.value) || 5)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className={cn(
            'flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isSaving
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary/90'
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {mode === 'create' ? 'Crear Tipo' : 'Guardar Cambios'}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => router.push('/settings/novedades')}
          className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
