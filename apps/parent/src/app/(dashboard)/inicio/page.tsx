'use client';

import { useState } from 'react';
import { Users, Clock } from 'lucide-react';
import { useAllChildrenTrips, useMyChildrenUpcomingTrips } from '@/hooks';
import { LoadingState, EmptyState } from '@/components/core';
import { GreetingHeader, UpcomingTripCard } from '@/components/modules/tracking';
import { ExpandableTrackingCard } from '@/components/home/ExpandableTrackingCard';
import { Id } from '../../../../../../convex/_generated/dataModel';

export default function InicioPage() {
  const { children, isLoading, isEmpty } = useAllChildrenTrips();
  const { upcomingTrips, isLoading: upcomingLoading } = useMyChildrenUpcomingTrips(12);

  // State to track which card is expanded (only one at a time)
  const [expandedStudentId, setExpandedStudentId] = useState<Id<"students"> | null>(null);

  const handleToggleExpand = (studentId: Id<"students">) => {
    setExpandedStudentId((current) => (current === studentId ? null : studentId));
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pb-20">
        <GreetingHeader />
        <LoadingState message="Cargando informacion..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Greeting header */}
      <GreetingHeader />

      {/* Children list - active trips */}
      {isEmpty ? (
        <EmptyState
          icon={Users}
          title="Sin hijos registrados"
          description="Contacta a tu institucion para registrar a tus hijos en el sistema."
        />
      ) : (
        <div className="space-y-4">
          {children.map((child) => (
            <ExpandableTrackingCard
              key={child._id}
              student={child}
              isExpanded={expandedStudentId === child._id}
              onToggleExpand={() => handleToggleExpand(child._id)}
            />
          ))}
        </div>
      )}

      {/* Upcoming trips section */}
      {!isEmpty && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Próximos Viajes</h2>
          </div>

          {upcomingLoading ? (
            <LoadingState message="Cargando próximos viajes..." size="sm" />
          ) : upcomingTrips.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">
                No hay viajes programados en las próximas horas
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTrips.map((trip) => (
                <UpcomingTripCard
                  key={`${trip.studentId}-${trip.scheduledTime}-${trip.routeType}`}
                  trip={trip}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
