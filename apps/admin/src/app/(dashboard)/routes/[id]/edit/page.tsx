'use client';

/**
 * Edit Route Page
 *
 * Uses the RouteWizard in edit mode for updating routes
 * with the same optimization flow as creating routes.
 */

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { useRoute, useRouteMutations } from '@/hooks';
import { RouteWizard, Step1Data, Step2Data, Step3Data, RouteWizardInitialData } from '@/components/routes/wizard';
import type { Id } from '../../../../../../../../convex/_generated/dataModel';

export default function EditRoutePage() {
  const params = useParams();
  const routeId = params.id as string;

  // Real data from Convex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { route, isLoading, notFound } = useRoute(routeId as any);
  const { updateRouteWithStops } = useRouteMutations();

  // Transform route data to wizard format
  const initialData: RouteWizardInitialData | undefined = useMemo(() => {
    if (!route) return undefined;

    // Get student IDs from students array (which comes from studentRoutes)
    const assignedStudentIds = (route.students || [])
      .filter((s): s is NonNullable<typeof s> => s !== null)
      .map(s => s.id as string);

    return {
      routeId: route._id as string,
      name: route.name,
      type: route.type,
      scheduledStartTime: route.scheduledStartTime,
      scheduledEndTime: route.scheduledEndTime,
      vehicleId: route.vehicleId as string,
      driverId: route.driverId as string,
      monitorId: route.monitorId as string | undefined,
      schoolArrivalTime: route.schoolArrivalTime,
      schoolDepartureTime: route.schoolDepartureTime,
      recurrence: route.recurrence,
      optimizedPolyline: route.optimizedPolyline,
      estimatedDuration: route.estimatedDuration,
      estimatedDistance: route.estimatedDistance,
      isActive: route.isActive,
      assignedStudentIds,
    };
  }, [route]);

  const handleSave = async (data: {
    step1: Step1Data;
    step2: Step2Data;
    step3: Step3Data;
  }) => {
    const { step1, step2, step3 } = data;

    if (!step2.optimizationResult) {
      throw new Error('La ruta no ha sido optimizada');
    }

    // Build stops array from optimization result
    const stops = step2.optimizationResult.stops.map((stop, index) => ({
      name: `Parada ${index + 1} - ${stop.studentName}`,
      address: stop.address,
      latitude: stop.position.lat,
      longitude: stop.position.lng,
      scheduledTime: stop.estimatedArrivalTime,
      estimatedArrivalTime: stop.estimatedArrivalTime,
      durationFromPrevious: stop.durationFromPrevious,
      order: index + 1,
      geofenceRadius: 100,
      studentId: stop.studentId as Id<'students'>,
    }));

    await updateRouteWithStops(routeId as Id<'routes'>, {
      name: step1.routeName,
      type: step1.routeType as 'pickup' | 'dropoff',
      vehicleId: step1.vehicleId as Id<'vehicles'>,
      driverId: step1.driverId as Id<'drivers'>,
      monitorId: step1.monitorId ? (step1.monitorId as Id<'monitors'>) : undefined,
      scheduledStartTime: step2.optimizationResult.startTime,
      scheduledEndTime: step2.optimizationResult.endTime,
      schoolArrivalTime: step1.routeType === 'pickup' ? step1.targetTime : undefined,
      schoolDepartureTime: step1.routeType === 'dropoff' ? step1.targetTime : undefined,
      recurrence: step3.recurrence,
      optimizedPolyline: step2.optimizationResult.encodedPolyline,
      estimatedDuration: Math.round(step2.optimizationResult.totalDuration / 60), // Convert seconds to minutes
      estimatedDistance: step2.optimizationResult.totalDistance,
      stops,
      isActive: step3.isActive,
    });

    return { routeId };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando ruta...</span>
      </div>
    );
  }

  if (notFound || !route) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">Ruta no encontrada</p>
        <Link href="/routes" className="text-primary hover:underline mt-2 inline-block">
          Volver a rutas
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Editar ${route.name}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Rutas', href: '/routes' },
          { label: route.name, href: `/routes/${routeId}` },
          { label: 'Editar' },
        ]}
        backHref={`/routes/${routeId}`}
      />

      <RouteWizard
        mode="edit"
        initialData={initialData}
        onSave={handleSave}
      />
    </div>
  );
}
