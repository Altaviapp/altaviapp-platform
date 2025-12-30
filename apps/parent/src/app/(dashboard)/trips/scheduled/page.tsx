'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bus, MapPin, Clock, AlertTriangle, ChevronLeft, User,
  Calendar, ArrowRight, ArrowLeft, CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/core';
import { NovedadContextButton } from '@/components/home/NovedadContextButton';
import { useStudent } from '@/hooks';
import { Id } from '../../../../../../../convex/_generated/dataModel';

/**
 * Scheduled Trip Detail Page - Parent
 *
 * Shows projected trip details for trips that haven't started yet.
 * Uses URL params: routeId, date, studentId, routeName, routeType, stopName, scheduledTime
 */
export default function ScheduledTripPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get data from URL params
  const studentId = searchParams.get('studentId') as Id<"students"> | null;
  const routeId = searchParams.get('routeId');
  const date = searchParams.get('date');
  const routeName = searchParams.get('routeName');
  const routeType = searchParams.get('routeType') as 'pickup' | 'dropoff' | null;
  const stopName = searchParams.get('stopName');
  const scheduledTime = searchParams.get('scheduledTime');
  const hasNovedad = searchParams.get('hasNovedad') === 'true';
  const novedadStatus = searchParams.get('novedadStatus') as 'pending' | 'approved' | 'rejected' | null;

  // Verify student belongs to parent
  const { student, isLoading } = useStudent(studentId);

  // Format date for display
  const formatDateDisplay = (dateStr: string): string => {
    const dateObj = new Date(dateStr + 'T12:00:00');
    return dateObj.toLocaleDateString('es-EC', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Missing required params
  if (!studentId || !routeId || !date || !routeName || !routeType || !scheduledTime) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">Información incompleta</p>
        <Link href="/calendario" className="text-primary hover:underline mt-2 inline-block">
          Volver al calendario
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-gray-500">Cargando...</span>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">Estudiante no encontrado</p>
        <Link href="/calendario" className="text-primary hover:underline mt-2 inline-block">
          Volver al calendario
        </Link>
      </div>
    );
  }

  const studentName = `${student.firstName} ${student.lastName}`;

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {routeName}
            </h1>
            <p className="text-sm text-gray-500">
              {routeType === 'pickup' ? 'Recogida' : 'Entrega'} programada
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            Programado
          </span>
        </div>
      </div>

      {/* Date Banner */}
      <div className="bg-primary/5 border-b border-primary/10 px-4 py-3">
        <div className="flex items-center gap-2 text-primary">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium capitalize">{formatDateDisplay(date)}</span>
        </div>
      </div>

      {/* Child Info */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{studentName}</p>
            <p className="text-sm text-gray-500">{student.grade}</p>
          </div>
        </div>
      </div>

      {/* Trip Details */}
      <div className="px-4 py-4 space-y-4">
        {/* Route Type Card */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center",
              routeType === 'pickup' ? "bg-green-100" : "bg-blue-100"
            )}>
              {routeType === 'pickup' ? (
                <ArrowRight className="w-6 h-6 text-green-600" />
              ) : (
                <ArrowLeft className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Tipo de viaje</p>
              <p className="font-semibold text-gray-900">
                {routeType === 'pickup' ? 'Recogida (Casa → Colegio)' : 'Entrega (Colegio → Casa)'}
              </p>
            </div>
          </div>
        </Card>

        {/* Time Card */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Hora programada</p>
              <p className="font-semibold text-gray-900 text-xl">{scheduledTime}</p>
            </div>
          </div>
        </Card>

        {/* Stop Card */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Parada asignada</p>
              <p className="font-semibold text-gray-900">{stopName || 'Sin parada asignada'}</p>
            </div>
          </div>
        </Card>

        {/* Novedad Status (if exists) */}
        {hasNovedad && (
          <Card className={cn(
            "p-4 border-2",
            novedadStatus === 'approved'
              ? "border-green-200 bg-green-50"
              : novedadStatus === 'rejected'
                ? "border-red-200 bg-red-50"
                : "border-yellow-200 bg-yellow-50"
          )}>
            <div className="flex items-center gap-3">
              {novedadStatus === 'approved' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  Novedad {novedadStatus === 'approved' ? 'aprobada' : novedadStatus === 'rejected' ? 'rechazada' : 'pendiente'}
                </p>
                <p className="text-sm text-gray-600">
                  {novedadStatus === 'pending'
                    ? 'Tu solicitud está siendo revisada'
                    : novedadStatus === 'approved'
                      ? 'Tu solicitud fue aprobada'
                      : 'Tu solicitud fue rechazada'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Bus className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Viaje programado</p>
              <p className="text-sm text-blue-700 mt-1">
                Este viaje aún no ha iniciado. El seguimiento en vivo estará disponible cuando el conductor inicie la ruta.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe">
        <NovedadContextButton
          studentId={studentId}
          studentName={studentName}
          date={date}
          routeType={routeType}
          variant="full"
          label="Reportar novedad para este viaje"
        />
      </div>
    </div>
  );
}
