'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { NovedadTypeForm } from '@/components/settings/NovedadTypeForm';
import { useNovedadType } from '@/hooks';
import type { Id } from '../../../../../../../../convex/_generated/dataModel';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Edit Novedad Type Page
 *
 * Form to edit an existing novedad type.
 */
export default function EditNovedadTypePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const typeId = resolvedParams.id as Id<"novedadTypes">;
  const { type, isLoading } = useNovedadType(typeId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando tipo...</span>
      </div>
    );
  }

  if (!type) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/settings/novedades"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tipo no encontrado</h1>
          </div>
        </div>

        <div className="bg-error/10 border border-error/20 rounded-xl p-6 flex items-center gap-4">
          <AlertCircle className="w-8 h-8 text-error flex-shrink-0" />
          <div>
            <p className="font-medium text-error">No se encontró el tipo de novedad</p>
            <p className="text-sm text-gray-600 mt-1">
              El tipo que buscas no existe o no tienes permiso para verlo.
            </p>
          </div>
        </div>

        <Link
          href="/settings/novedades"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a tipos de novedades
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/settings/novedades"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar: {type.name}</h1>
          <p className="text-gray-500">
            {type.isSystemType
              ? 'Este es un tipo de sistema. Algunos campos no se pueden modificar.'
              : 'Modifica la configuración de este tipo de novedad'}
          </p>
        </div>
      </div>

      {/* Form */}
      <NovedadTypeForm
        mode="edit"
        initialData={{
          _id: type._id,
          name: type.name,
          description: type.description,
          icon: type.icon,
          color: type.color,
          category: type.category as any,
          durationType: type.durationType as any,
          requiresApproval: type.requiresApproval,
          affectsTrips: type.affectsTrips,
          affectsRouteCalculation: type.affectsRouteCalculation,
          evidenceRequired: type.evidenceRequired,
          evidenceOptional: type.evidenceOptional,
          maxEvidenceFiles: type.maxEvidenceFiles,
          allowedFileTypes: type.allowedFileTypes,
          minAdvanceHours: type.minAdvanceHours,
          reasonRequired: type.reasonRequired,
          isSystemType: type.isSystemType,
        }}
      />
    </div>
  );
}
