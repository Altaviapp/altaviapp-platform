'use client';

/**
 * New Route Page
 *
 * Uses the multi-step wizard for creating optimized routes
 * with student assignments and Google Maps route calculation.
 */

import { PageHeader } from '@/components/shared';
import { useRouteMutations } from '@/hooks';
import { RouteWizard, Step1Data, Step2Data, Step3Data } from '@/components/routes/wizard';
import type { Id } from '../../../../../../../convex/_generated/dataModel';

export default function NewRoutePage() {
  const { createRouteWithStops } = useRouteMutations();

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

    const result = await createRouteWithStops({
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
      estimatedDuration: step2.optimizationResult.totalDuration,
      estimatedDistance: step2.optimizationResult.totalDistance,
      stops,
      isActive: step3.isActive,
    });

    return { routeId: result.routeId as string };
  };

  return (
    <div>
      <PageHeader
        title="Nueva Ruta"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Rutas', href: '/routes' },
          { label: 'Nueva Ruta' },
        ]}
        backHref="/routes"
      />

      <RouteWizard onSave={handleSave} />
    </div>
  );
}
