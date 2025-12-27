'use client';

import { Calendar } from 'lucide-react';
import { useAllChildrenTrips } from '@/hooks';
import { ChildTripCard } from '@/components/home';
import { LoadingState } from '@/components/shared/LoadingState';
import { getGreeting } from '@/lib/utils';

export default function InicioPage() {
  const { children, isLoading, isEmpty } = useAllChildrenTrips();
  const greeting = getGreeting();

  // Get today's date formatted
  const today = new Date().toLocaleDateString('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Greeting skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-32" />
        </div>

        {/* Cards skeleton */}
        <div className="space-y-4">
          <LoadingState variant="card" />
          <LoadingState variant="card" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{greeting}</h1>
        <div className="flex items-center gap-2 text-gray-500 mt-1">
          <Calendar className="w-4 h-4" />
          <span className="text-sm capitalize">{today}</span>
        </div>
      </div>

      {/* Children list */}
      {isEmpty ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Sin hijos registrados</h3>
          <p className="text-sm text-gray-500">
            Contacta a tu institución para registrar a tus hijos en el sistema.
          </p>
        </div>
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
