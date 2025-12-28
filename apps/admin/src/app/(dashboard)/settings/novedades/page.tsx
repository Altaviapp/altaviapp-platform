'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Loader2,
  Plus,
  ToggleLeft,
  ToggleRight,
  Trash2,
  GripVertical,
  Pencil,
  Info,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useNovedadTypes,
  useNovedadTypeMutations,
  CATEGORY_LABELS,
  DURATION_LABELS,
  COLOR_OPTIONS,
} from '@/hooks';
import type { Id } from '../../../../../../../convex/_generated/dataModel';

// Icon mapping
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

// Color class mapping
const COLOR_CLASSES: Record<string, { bg: string; text: string }> = {
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

/**
 * Novedades Types Settings Page
 *
 * Allows admin to view and manage configurable novedad types for the institution.
 * Features: list types, toggle active, reorder, create/edit types.
 */
export default function NovedadesSettingsPage() {
  const [showInactive, setShowInactive] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { types, isLoading } = useNovedadTypes(!showInactive);
  const { toggleActive, removeType, reorderTypes } = useNovedadTypeMutations();

  const handleToggleActive = async (typeId: Id<"novedadTypes">) => {
    setOperationLoading(typeId);
    setStatusMessage(null);
    try {
      const result = await toggleActive(typeId);
      setStatusMessage({
        type: 'success',
        message: result.isActive ? 'Tipo activado' : 'Tipo desactivado',
      });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Error al cambiar estado',
      });
    } finally {
      setOperationLoading(null);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleDelete = async (typeId: Id<"novedadTypes">) => {
    if (!confirm('¿Estás seguro de eliminar este tipo? Esta acción no se puede deshacer.')) {
      return;
    }

    setOperationLoading(typeId);
    setStatusMessage(null);
    try {
      await removeType(typeId);
      setStatusMessage({ type: 'success', message: 'Tipo eliminado' });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Error al eliminar',
      });
    } finally {
      setOperationLoading(null);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newOrder = [...types];
    const temp = newOrder[index - 1]!;
    newOrder[index - 1] = newOrder[index]!;
    newOrder[index] = temp;

    try {
      await reorderTypes(newOrder.map(t => t._id));
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al reordenar',
      });
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === types.length - 1) return;
    const newOrder = [...types];
    const temp = newOrder[index]!;
    newOrder[index] = newOrder[index + 1]!;
    newOrder[index + 1] = temp;

    try {
      await reorderTypes(newOrder.map(t => t._id));
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Error al reordenar',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando tipos de novedades...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/settings"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Tipos de Novedades</h1>
          <p className="text-gray-500">Configura los tipos de novedades disponibles para padres</p>
        </div>
        <Link
          href="/settings/novedades/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Tipo
        </Link>
      </div>

      {/* Info Card */}
      <div className="bg-info/10 border border-info/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-info">Tipos de Novedades Configurables</p>
            <p className="text-sm text-gray-600 mt-1">
              Los tipos de novedades definen qué opciones ven los padres al reportar ausencias,
              cambios de recogida, y otras situaciones. Los tipos del sistema no se pueden eliminar,
              pero puedes desactivarlos.
            </p>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div
          className={cn(
            'rounded-xl p-4 flex items-center gap-3',
            statusMessage.type === 'success'
              ? 'bg-success/10 border border-success/20'
              : 'bg-error/10 border border-error/20'
          )}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-success" />
          ) : (
            <AlertCircle className="w-5 h-5 text-error" />
          )}
          <p
            className={cn(
              'text-sm font-medium',
              statusMessage.type === 'success' ? 'text-success' : 'text-error'
            )}
          >
            {statusMessage.message}
          </p>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-600">Mostrar tipos inactivos</span>
        </label>
        <span className="text-sm text-gray-400">
          {types.length} tipo{types.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Types List */}
      <div className="bg-white rounded-xl shadow divide-y divide-gray-100">
        {types.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay tipos de novedades</p>
            <p className="text-sm text-gray-400 mt-1">
              Crea un nuevo tipo o ejecuta el seed para agregar los tipos por defecto
            </p>
          </div>
        ) : (
          types.map((type, index) => {
            const IconComponent = ICONS[type.icon] || FileText;
            const colorClass = COLOR_CLASSES[type.color] ?? { bg: 'bg-gray-100', text: 'text-gray-600' };
            const isExpanded = expandedId === type._id;
            const isLoading = operationLoading === type._id;

            return (
              <div
                key={type._id}
                className={cn(
                  'transition-colors',
                  !type.isActive && 'opacity-60'
                )}
              >
                {/* Main Row */}
                <div className="flex items-center gap-3 p-4 hover:bg-gray-50">
                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className={cn(
                        'p-0.5 rounded',
                        index === 0
                          ? 'text-gray-200 cursor-not-allowed'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === types.length - 1}
                      className={cn(
                        'p-0.5 rounded',
                        index === types.length - 1
                          ? 'text-gray-200 cursor-not-allowed'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Icon */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      colorClass.bg
                    )}
                  >
                    <IconComponent className={cn('w-5 h-5', colorClass.text)} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{type.name}</p>
                      {type.isSystemType && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded">
                          SISTEMA
                        </span>
                      )}
                      {!type.isActive && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded">
                          INACTIVO
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{type.description}</p>
                  </div>

                  {/* Category Badge */}
                  <span className="hidden sm:inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    {CATEGORY_LABELS[type.category as keyof typeof CATEGORY_LABELS] || type.category}
                  </span>

                  {/* Duration Badge */}
                  <span className="hidden md:inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    {DURATION_LABELS[type.durationType as keyof typeof DURATION_LABELS] || type.durationType}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : type._id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <Link
                      href={`/settings/novedades/${type._id}`}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleToggleActive(type._id)}
                      disabled={isLoading}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        type.isActive
                          ? 'text-success hover:text-success/80 hover:bg-success/10'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                      )}
                      title={type.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : type.isActive ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                    </button>
                    {!type.isSystemType && (
                      <button
                        onClick={() => handleDelete(type._id)}
                        disabled={isLoading}
                        className="p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg border border-gray-100">
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase mb-1">Código</p>
                        <p className="text-sm font-mono text-gray-700">{type.code}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase mb-1">Requiere Aprobación</p>
                        <p className="text-sm text-gray-700">{type.requiresApproval ? 'Sí' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase mb-1">Afecta Viajes</p>
                        <p className="text-sm text-gray-700">{type.affectsTrips ? 'Sí' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase mb-1">Recalcula Ruta</p>
                        <p className="text-sm text-gray-700">{type.affectsRouteCalculation ? 'Sí' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase mb-1">Evidencia</p>
                        <p className="text-sm text-gray-700">
                          {type.evidenceRequired
                            ? 'Requerida'
                            : type.evidenceOptional
                            ? 'Opcional'
                            : 'No'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase mb-1">Razón Requerida</p>
                        <p className="text-sm text-gray-700">{type.reasonRequired ? 'Sí' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase mb-1">Anticipación Mínima</p>
                        <p className="text-sm text-gray-700">
                          {type.minAdvanceHours ? `${type.minAdvanceHours} horas` : 'Sin mínimo'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase mb-1">Max Archivos</p>
                        <p className="text-sm text-gray-700">
                          {type.maxEvidenceFiles || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4">
        <Link
          href="/settings"
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Volver a Configuración
        </Link>
        <p className="text-xs text-gray-400">
          Los cambios se guardan automáticamente
        </p>
      </div>
    </div>
  );
}
