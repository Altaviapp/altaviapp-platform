'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, PlayCircle, MapPin, Users, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { mockTodayTrips } from '@/lib/mockData';

/**
 * Start Trip Confirmation Page
 *
 * Shows trip summary and confirmation before starting the active trip
 */
export default function StartTripPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = (params?.id as string) || '';
  const [checklistCompleted, setChecklistCompleted] = useState(false);

  // Find trip (in production, this would fetch from Convex)
  const trip = mockTodayTrips.find(t => t._id === tripId);

  // Check if checklist was completed (from localStorage or trip data)
  useEffect(() => {
    const completed = localStorage.getItem(`checklist_completed_${tripId}`) === 'true' || trip?.checklistCompleted || false;
    setChecklistCompleted(completed);
  }, [tripId, trip]);

  if (!trip) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-600">Viaje no encontrado</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-primary font-medium"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleStartTrip = () => {
    // TODO: Initialize trip state with useActiveTrip
    router.push(`/trips/${tripId}/active`);
  };

  const totalStops = trip.stops?.length || 0;
  const totalStudents = trip.studentsAssigned?.length || 0;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Confirmar Inicio de Viaje
        </h1>
      </div>

      {/* Trip Summary Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-primary/5 border-b border-primary/10 p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <PlayCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {trip.route?.name}
              </h2>
              <p className="text-sm text-gray-600">
                {trip.type === 'inbound' ? 'Viaje de Ida' : 'Viaje de Vuelta'}
              </p>
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div className="p-4 space-y-4">
          {/* Route Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600">Paradas</p>
                <p className="text-lg font-bold text-gray-900">{totalStops}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <Users className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600">Estudiantes</p>
                <p className="text-lg font-bold text-gray-900">{totalStudents}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <Clock className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600">Hora estimada</p>
                <p className="text-lg font-bold text-gray-900">
                  {trip.scheduledStartTime} - {trip.scheduledEndTime}
                </p>
              </div>
            </div>
          </div>

          {/* Checklist Status */}
          {checklistCompleted ? (
            <div className="flex items-start gap-3 bg-success/10 border border-success/20 rounded-lg p-3">
              <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-success">Checklist Pre-Viaje Completado</p>
                <p className="text-xs text-gray-600 mt-1">
                  El vehículo ha sido inspeccionado y está listo para el viaje
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 bg-warning/10 border border-warning/20 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-warning">Checklist Pre-Viaje Pendiente</p>
                <p className="text-xs text-gray-600 mt-1">
                  Debes completar el checklist antes de iniciar el viaje
                </p>
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="bg-info/10 border border-info/20 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-gray-900">Importante:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-info mt-0.5">•</span>
                <span>El GPS comenzará a rastrear tu ubicación durante el viaje</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-info mt-0.5">•</span>
                <span>Asegúrate de tener una conexión estable a internet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-info mt-0.5">•</span>
                <span>Marca cada parada cuando llegues para actualizar el estado</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-4 -mb-6 px-4 py-4 md:static md:border-0 md:mx-0 md:mb-0 md:px-0 md:py-0 space-y-3">
        <button
          onClick={handleStartTrip}
          disabled={!checklistCompleted}
          className={`w-full py-4 rounded-lg text-base font-bold transition-all ${
            checklistCompleted
              ? 'bg-accent hover:bg-accent/90 text-primary shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {checklistCompleted ? 'INICIAR VIAJE' : 'COMPLETAR CHECKLIST PRIMERO'}
        </button>

        {!checklistCompleted && (
          <Link
            href={`/trips/${tripId}/checklist`}
            className="block w-full px-4 py-3 border-2 border-primary rounded-lg text-sm font-bold text-primary hover:bg-primary/5 transition-colors text-center"
          >
            IR AL CHECKLIST
          </Link>
        )}

        <Link
          href="/dashboard"
          className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-center"
        >
          Cancelar
        </Link>
      </div>
    </div>
  );
}
