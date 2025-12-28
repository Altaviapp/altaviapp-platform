'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { NovedadTypeForm } from '@/components/settings/NovedadTypeForm';

/**
 * New Novedad Type Page
 *
 * Form to create a new novedad type for the institution.
 */
export default function NewNovedadTypePage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Tipo de Novedad</h1>
          <p className="text-gray-500">Crea un tipo de novedad personalizado para tu institución</p>
        </div>
      </div>

      {/* Form */}
      <NovedadTypeForm mode="create" />
    </div>
  );
}
