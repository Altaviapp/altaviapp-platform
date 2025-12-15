'use client';

import { useState } from 'react';
import { ChevronDown, Bus, MapPin, Clock, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Mock data for students
const students = [
  { id: 1, name: 'Sofía García' },
  { id: 2, name: 'Carlos García' },
];

// Mock trip history data
const tripHistory = [
  {
    date: 'Hoy - 03/12/2024',
    trips: [
      {
        id: 1,
        type: 'ida',
        status: 'completed',
        route: 'Centro - Escuela Altaviapp',
        driver: 'Juan Pérez',
        boardedAt: '07:45',
        arrivedAt: '08:12',
        distance: 8.5,
        duration: 27,
      },
      {
        id: 2,
        type: 'vuelta',
        status: 'in_progress',
        route: 'Escuela Altaviapp - Centro',
        driver: 'Juan Pérez',
        boardedAt: '14:05',
        arrivedAt: null,
        eta: '14:35',
        progress: 33,
        stopsCompleted: 2,
        totalStops: 6,
      },
    ],
  },
  {
    date: 'Ayer - 02/12/2024',
    trips: [
      {
        id: 3,
        type: 'ida',
        status: 'completed',
        route: 'Centro - Escuela Altaviapp',
        driver: 'Juan Pérez',
        boardedAt: '07:42',
        arrivedAt: '08:08',
        distance: 8.5,
        duration: 26,
      },
      {
        id: 4,
        type: 'vuelta',
        status: 'completed',
        route: 'Escuela Altaviapp - Centro',
        driver: 'Juan Pérez',
        boardedAt: '14:03',
        arrivedAt: '14:32',
        distance: 8.2,
        duration: 29,
      },
    ],
  },
  {
    date: '01/12/2024',
    trips: [
      {
        id: 5,
        type: 'ida',
        status: 'completed',
        route: 'Centro - Escuela Altaviapp',
        driver: 'Juan Pérez',
        boardedAt: '07:48',
        arrivedAt: '08:15',
        distance: 8.5,
        duration: 27,
      },
      {
        id: 6,
        type: 'vuelta',
        status: 'completed',
        route: 'Escuela Altaviapp - Centro',
        driver: 'María González',
        boardedAt: '14:10',
        arrivedAt: '14:38',
        distance: 8.3,
        duration: 28,
      },
    ],
  },
];

const periods = [
  { value: 'week', label: 'Última semana' },
  { value: 'month', label: 'Último mes' },
  { value: 'quarter', label: 'Últimos 3 meses' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  completed: { label: 'COMPLETADO', color: 'text-white', bg: 'bg-success', icon: 'check' },
  in_progress: { label: 'EN CURSO', color: 'text-white', bg: 'bg-info', icon: 'bus' },
  cancelled: { label: 'CANCELADO', color: 'text-white', bg: 'bg-error', icon: 'x' },
};

export default function HistoryPage() {
  const [selectedStudent, setSelectedStudent] = useState(students[0]!);
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]!);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-2 gap-3">
        {/* Student Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setShowStudentSelector(!showStudentSelector);
              setShowPeriodSelector(false);
            }}
            className="w-full bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between"
          >
            <span className="text-sm text-gray-900 truncate">{selectedStudent.name}</span>
            <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform flex-shrink-0', showStudentSelector && 'rotate-180')} />
          </button>

          {showStudentSelector && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-10 overflow-hidden">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => {
                    setSelectedStudent(student);
                    setShowStudentSelector(false);
                  }}
                  className={cn(
                    'w-full p-3 text-left text-sm hover:bg-gray-50 transition-colors',
                    selectedStudent.id === student.id && 'bg-primary-50 text-primary'
                  )}
                >
                  {student.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Period Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setShowPeriodSelector(!showPeriodSelector);
              setShowStudentSelector(false);
            }}
            className="w-full bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between"
          >
            <span className="text-sm text-gray-900 truncate">{selectedPeriod.label}</span>
            <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform flex-shrink-0', showPeriodSelector && 'rotate-180')} />
          </button>

          {showPeriodSelector && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-10 overflow-hidden">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => {
                    setSelectedPeriod(period);
                    setShowPeriodSelector(false);
                  }}
                  className={cn(
                    'w-full p-3 text-left text-sm hover:bg-gray-50 transition-colors',
                    selectedPeriod.value === period.value && 'bg-primary-50 text-primary'
                  )}
                >
                  {period.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trip History */}
      {tripHistory.map((day) => (
        <div key={day.date}>
          {/* Date Header */}
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">{day.date}</span>
          </div>

          {/* Trips */}
          <div className="space-y-3">
            {day.trips.map((trip) => {
              const status = statusConfig[trip.status] ?? statusConfig.completed!;

              return (
                <div
                  key={trip.id}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bus className="w-5 h-5 text-primary" />
                      <span className="font-medium text-gray-900">
                        Viaje de {trip.type === 'ida' ? 'Ida' : 'Vuelta'}
                      </span>
                    </div>
                    <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', status.bg, status.color)}>
                      {status.label}
                    </span>
                  </div>

                  {/* Route & Driver */}
                  <p className="text-sm text-gray-600 mb-1">{trip.route}</p>
                  <p className="text-sm text-gray-500 mb-3">Conductor: {trip.driver}</p>

                  {/* Times */}
                  {trip.status === 'completed' ? (
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Abordó: <strong>{trip.boardedAt}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Bajó: <strong>{trip.arrivedAt}</strong></span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Abordó: <strong>{trip.boardedAt}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">ETA: <strong>{trip.eta}</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Progress for in_progress trips */}
                  {trip.status === 'in_progress' && (
                    <div className="mb-3">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-info rounded-full transition-all"
                          style={{ width: `${trip.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Progreso: {trip.stopsCompleted}/{trip.totalStops} paradas
                      </p>
                    </div>
                  )}

                  {/* Stats for completed trips */}
                  {trip.status === 'completed' && (
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Distancia: {trip.distance} km</span>
                      <span>Duración: {trip.duration} min</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    {trip.status === 'in_progress' ? (
                      <Link
                        href="/tracking"
                        className="flex items-center gap-1 text-sm text-info hover:underline"
                      >
                        <MapPin className="w-4 h-4" />
                        Ver en mapa
                      </Link>
                    ) : (
                      <>
                        <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary">
                          <MapPin className="w-4 h-4" />
                          Ver ruta
                        </button>
                        <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary ml-4">
                          <ChevronRight className="w-4 h-4" />
                          Detalles
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Load More */}
      <button className="w-full py-3 text-center text-sm text-primary font-medium hover:underline">
        Cargar más viajes...
      </button>
    </div>
  );
}
