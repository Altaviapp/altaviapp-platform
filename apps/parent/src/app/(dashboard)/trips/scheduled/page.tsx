'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sunrise,
  Sunset,
  Clock,
  MapPin,
  Bus,
  Calendar,
  ChevronLeft,
  AlertTriangle,
  Info,
  User,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudent } from '@/hooks';
import { NovedadContextButton } from '@/components/home/NovedadContextButton';
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
  const studentId = searchParams?.get('studentId') as Id<"students"> | null;
  const routeId = searchParams?.get('routeId');
  const date = searchParams?.get('date');
  const routeName = searchParams?.get('routeName');
  const routeType = searchParams?.get('routeType') as 'pickup' | 'dropoff' | null;
  const stopName = searchParams?.get('stopName');
  const scheduledTime = searchParams?.get('scheduledTime');
  const hasNovedad = searchParams?.get('hasNovedad') === 'true';
  const novedadStatus = searchParams?.get('novedadStatus') as 'pending' | 'approved' | 'rejected' | null;

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
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-600 mb-4">Información incompleta</p>
        <Link href="/calendario" className="text-primary font-medium">
          Volver al calendario
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-4">
        <User className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-600 mb-4">Estudiante no encontrado</p>
        <Link href="/calendario" className="text-primary font-medium">
          Volver al calendario
        </Link>
      </div>
    );
  }

  const studentName = `${student.firstName} ${student.lastName}`;
  const studentInitials = `${student.firstName[0]}${student.lastName[0]}`;
  const isPickup = routeType === 'pickup';
  const Icon = isPickup ? Sunrise : Sunset;
  const typeLabel = isPickup ? 'Recogida' : 'Entrega';
  const typeBgLight = isPickup ? 'bg-amber-50' : 'bg-sky-50';
  const typeBgMedium = isPickup ? 'bg-amber-100' : 'bg-sky-100';
  const typeTextColor = isPickup ? 'text-amber-600' : 'text-sky-600';

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className={cn('flex-shrink-0 safe-area-pt', typeBgLight)}>
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', typeBgMedium)}>
            <Icon className={cn('w-5 h-5', typeTextColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">{routeName}</h1>
            <p className="text-sm text-gray-500">{typeLabel} programada</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            Programado
          </span>
        </div>
      </header>

      {/* Date Banner */}
      <div className="bg-primary/5 border-b border-primary/10 px-4 py-3">
        <div className="flex items-center gap-2 text-primary">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium capitalize">{formatDateDisplay(date)}</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto overscroll-contain pb-24">
        <div className="p-4 space-y-3">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Viaje programado</p>
                <p className="text-sm text-blue-700 mt-1">
                  Este viaje aún no ha iniciado. El seguimiento en vivo estará disponible cuando el conductor inicie la ruta.
                </p>
              </div>
            </div>
          </div>

          {/* Student Card */}
          <section className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Estudiante
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">{studentInitials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{studentName}</p>
                <p className="text-sm text-gray-500">{student.grade}</p>
              </div>
            </div>
          </section>

          {/* Novedad Status (if exists) */}
          {hasNovedad && (
            <section className={cn(
              'rounded-2xl p-4 shadow-sm border-2',
              novedadStatus === 'approved'
                ? 'border-green-200 bg-green-50'
                : novedadStatus === 'rejected'
                  ? 'border-red-200 bg-red-50'
                  : 'border-amber-200 bg-amber-50'
            )}>
              <div className="flex items-center gap-3">
                {novedadStatus === 'approved' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className={cn(
                    'w-5 h-5 flex-shrink-0',
                    novedadStatus === 'rejected' ? 'text-red-600' : 'text-amber-600'
                  )} />
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
            </section>
          )}

          {/* Trip Info */}
          <section className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Información del Viaje
            </h2>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Hora programada</p>
                  <p className="text-sm font-medium text-gray-900">{scheduledTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Parada asignada</p>
                  <p className="text-sm font-medium text-gray-900">{stopName || 'Sin parada asignada'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Bus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Tipo de viaje</p>
                  <p className="text-sm font-medium text-gray-900">
                    {isPickup ? 'Recogida (Casa → Colegio)' : 'Entrega (Colegio → Casa)'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom spacing for fixed button */}
          <div className="h-4" />
        </div>
      </main>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe z-10">
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
