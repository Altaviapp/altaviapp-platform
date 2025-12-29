'use client';

import { useParams } from 'next/navigation';
import { TripStartWizard } from '@/components/wizard';

/**
 * Página de Inicio de Viaje - Wizard
 *
 * Flujo:
 * 1. Pregunta sobre inspección del vehículo (opcional)
 * 2. Formulario de checklist (si eligió hacerlo)
 * 3. Preview del viaje (ruta, estudiantes, novedades)
 * 4. Confirmación final → Crear trip → Ir a viaje activo
 */
export default function RouteStartPage() {
  const params = useParams();
  const routeId = (params?.id as string) || '';

  if (!routeId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-gray-600">ID de ruta no válido</p>
      </div>
    );
  }

  return <TripStartWizard routeId={routeId} />;
}
