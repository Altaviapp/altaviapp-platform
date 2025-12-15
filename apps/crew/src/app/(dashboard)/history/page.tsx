'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, ChevronDown, Bus, Clock, MapPin, Users, ChevronRight, CheckCircle, AlertTriangle, Sun, Moon, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock user for UI testing
const mockUser = {
  name: 'Carlos Pérez',
  email: 'carlos@test.com',
  role: 'driver' as const,
};

// Mock trip history
const tripHistory = [
  {
    date: 'Hoy - 03/12/2024',
    trips: [
      {
        _id: 'trip-h1',
        type: 'ida',
        status: 'completed',
        route: 'Centro - Escuela Altaviapp',
        startTime: '06:32',
        endTime: '07:18',
        duration: 46,
        distance: 8.5,
        studentsTransported: 28,
        studentsExpected: 30,
        incidents: 0,
      },
    ],
  },
  {
    date: 'Ayer - 02/12/2024',
    trips: [
      {
        _id: 'trip-h2',
        type: 'vuelta',
        status: 'completed',
        route: 'Escuela Altaviapp - Centro',
        startTime: '14:05',
        endTime: '14:58',
        duration: 53,
        distance: 8.2,
        studentsTransported: 28,
        studentsExpected: 28,
        incidents: 0,
      },
      {
        _id: 'trip-h3',
        type: 'ida',
        status: 'completed',
        route: 'Centro - Escuela Altaviapp',
        startTime: '06:28',
        endTime: '07:22',
        duration: 54,
        distance: 8.5,
        studentsTransported: 30,
        studentsExpected: 30,
        incidents: 1,
        incidentNote: '1 retraso por tráfico',
      },
    ],
  },
  {
    date: '01/12/2024',
    trips: [
      {
        _id: 'trip-h4',
        type: 'vuelta',
        status: 'completed',
        route: 'Escuela Altaviapp - Centro',
        startTime: '14:02',
        endTime: '14:55',
        duration: 53,
        distance: 8.3,
        studentsTransported: 29,
        studentsExpected: 30,
        incidents: 0,
      },
      {
        _id: 'trip-h5',
        type: 'ida',
        status: 'completed',
        route: 'Centro - Escuela Altaviapp',
        startTime: '06:30',
        endTime: '07:15',
        duration: 45,
        distance: 8.5,
        studentsTransported: 30,
        studentsExpected: 30,
        incidents: 0,
      },
    ],
  },
];

const periods = [
  { value: 'week', label: 'Última semana' },
  { value: 'month', label: 'Último mes' },
  { value: 'quarter', label: 'Últimos 3 meses' },
];

export default function HistoryPage() {
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]!);
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const user = mockUser;

  // Stats summary
  const totalTrips = tripHistory.flatMap(d => d.trips).length;
  const totalStudents = tripHistory.flatMap(d => d.trips).reduce((acc, t) => acc + t.studentsTransported, 0);
  const totalIncidents = tripHistory.flatMap(d => d.trips).reduce((acc, t) => acc + t.incidents, 0);
  const avgDuration = Math.round(tripHistory.flatMap(d => d.trips).reduce((acc, t) => acc + t.duration, 0) / totalTrips);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Historial de Viajes</h1>
      </div>

      {/* Period Selector */}
      <div className="relative">
        <button
          onClick={() => setShowPeriodSelector(!showPeriodSelector)}
          className="w-full bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between"
        >
          <span className="text-sm text-gray-900">{selectedPeriod.label}</span>
          <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', showPeriodSelector && 'rotate-180')} />
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

      {/* Stats Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Resumen del período</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-xl font-bold text-primary">{totalTrips}</p>
            <p className="text-xs text-gray-500">Viajes</p>
          </div>
          <div>
            <p className="text-xl font-bold text-success">{totalStudents}</p>
            <p className="text-xs text-gray-500">Estudiantes</p>
          </div>
          <div>
            <p className="text-xl font-bold text-info">{avgDuration}m</p>
            <p className="text-xs text-gray-500">Promedio</p>
          </div>
          <div>
            <p className="text-xl font-bold text-warning">{totalIncidents}</p>
            <p className="text-xs text-gray-500">Incidentes</p>
          </div>
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
              const isIda = trip.type === 'ida';

              return (
                <div
                  key={trip._id}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', isIda ? 'bg-warning/10' : 'bg-primary/10')}>
                        {isIda ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-primary" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Viaje de {isIda ? 'Ida' : 'Vuelta'}</h3>
                        <p className="text-xs text-gray-500">{trip.route}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                      COMPLETADO
                    </span>
                  </div>

                  {/* Trip Details */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{trip.startTime} - {trip.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{trip.studentsTransported}/{trip.studentsExpected}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Duración: {trip.duration} min</span>
                    <span>Distancia: {trip.distance} km</span>
                  </div>

                  {/* Incidents */}
                  {trip.incidents > 0 && (
                    <div className="mt-3 p-2 bg-warning/10 rounded-lg flex items-center gap-2 text-sm text-warning-dark">
                      <AlertTriangle className="w-4 h-4" />
                      {trip.incidentNote}
                    </div>
                  )}

                  {trip.incidents === 0 && (
                    <div className="mt-3 p-2 bg-success/10 rounded-lg flex items-center gap-2 text-sm text-success-dark">
                      <CheckCircle className="w-4 h-4" />
                      Sin incidentes
                    </div>
                  )}

                  {/* View Details */}
                  <Link
                    href={`/history/${trip._id}`}
                    className="mt-3 flex items-center justify-center gap-1 text-sm text-primary hover:underline"
                  >
                    Ver detalles
                    <ChevronRight className="w-4 h-4" />
                  </Link>
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
