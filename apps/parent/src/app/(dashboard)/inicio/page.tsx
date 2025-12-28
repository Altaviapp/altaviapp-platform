'use client';

import { Users } from 'lucide-react';
import { useAllChildrenTrips } from '@/hooks';
import { LoadingState, EmptyState } from '@/components/core';
import { GreetingHeader, ChildTripCard } from '@/components/modules/tracking';

export default function InicioPage() {
  const { children, isLoading, isEmpty } = useAllChildrenTrips();

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

      {/* Children list */}
      {isEmpty ? (
        <EmptyState
          icon={Users}
          title="Sin hijos registrados"
          description="Contacta a tu institucion para registrar a tus hijos en el sistema."
        />
      ) : (
        <div className="space-y-4">
          {children.map((child) => (
            <ChildTripCard key={child._id} student={child} />
          ))}
        </div>
      )}
    </div>
  );
}
