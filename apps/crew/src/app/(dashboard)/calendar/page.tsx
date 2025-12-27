'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sunrise, Sunset, CheckCircle, Clock, XCircle, Bus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCalendarTrips } from '@/hooks';
import { LoadingState } from '@/components/shared/LoadingState';

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  scheduled: { color: 'bg-blue-500', icon: Clock },
  in_progress: { color: 'bg-green-500', icon: Bus },
  completed: { color: 'bg-gray-400', icon: CheckCircle },
  cancelled: { color: 'bg-red-500', icon: XCircle },
};

export default function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { trips, tripsByDate, isLoading } = useCalendarTrips(currentYear, currentMonth);

  // Navigate months
  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth() + 1);
    setCurrentYear(today.getFullYear());
    setSelectedDate(today.toISOString().split('T')[0]!);
  };

  // Generate calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const calendarDays: Array<{ day: number; date: string; isCurrentMonth: boolean }> = [];

  // Previous month days
  const prevMonthLastDay = new Date(currentYear, currentMonth - 1, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    calendarDays.push({
      day,
      date: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      isCurrentMonth: true,
    });
  }

  // Next month days
  const remainingDays = 42 - calendarDays.length; // 6 rows * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    calendarDays.push({
      day,
      date: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      isCurrentMonth: false,
    });
  }

  const todayString = today.toISOString().split('T')[0];
  const selectedTrips = selectedDate ? tripsByDate[selectedDate] || [] : [];

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" />
            Calendario
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {trips.length} viaje{trips.length !== 1 ? 's' : ''} en {monthNames[currentMonth - 1]}
          </p>
        </div>
        <button
          onClick={goToToday}
          className="px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
        >
          Hoy
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth - 1]} {currentYear}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-xs font-semibold text-gray-500 uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((calDay, index) => {
            const dayTrips = tripsByDate[calDay.date] || [];
            const hasTrips = dayTrips.length > 0;
            const isToday = calDay.date === todayString;
            const isSelected = calDay.date === selectedDate;

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(calDay.date)}
                className={cn(
                  'relative p-2 min-h-[60px] border-b border-r border-gray-100 text-left transition-colors',
                  !calDay.isCurrentMonth && 'bg-gray-50',
                  isSelected && 'bg-primary/5',
                  !isSelected && calDay.isCurrentMonth && 'hover:bg-gray-50'
                )}
              >
                <span className={cn(
                  'inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full',
                  isToday && 'bg-primary text-white',
                  !isToday && !calDay.isCurrentMonth && 'text-gray-400',
                  !isToday && calDay.isCurrentMonth && 'text-gray-900'
                )}>
                  {calDay.day}
                </span>

                {/* Trip indicators */}
                {hasTrips && (
                  <div className="flex gap-1 mt-1">
                    {dayTrips.slice(0, 3).map((trip, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-2 h-2 rounded-full',
                          statusConfig[trip.status]?.color || 'bg-gray-400'
                        )}
                      />
                    ))}
                    {dayTrips.length > 3 && (
                      <span className="text-xs text-gray-500">+{dayTrips.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Trips */}
      {selectedDate && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Viajes del {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-EC', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </h3>

          {selectedTrips.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay viajes programados para este día</p>
          ) : (
            <div className="space-y-3">
              {selectedTrips.map((trip) => {
                const isPickup = trip.routeType === 'pickup';
                const Icon = isPickup ? Sunrise : Sunset;
                const status = statusConfig[trip.status] ?? statusConfig.scheduled!;
                const StatusIcon = status.icon;

                return (
                  <Link
                    key={trip._id}
                    href={`/trips/${trip._id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isPickup ? 'bg-warning/10' : 'bg-info/10'
                    )}>
                      <Icon className={cn('w-5 h-5', isPickup ? 'text-warning' : 'text-info')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {trip.routeName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isPickup ? 'Recogida' : 'Entrega'}
                      </p>
                    </div>
                    <div className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                      trip.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                      trip.status === 'in_progress' ? 'bg-green-50 text-green-700' :
                      trip.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    )}>
                      <StatusIcon className="w-3 h-3" />
                      {trip.status === 'completed' ? 'Completado' :
                       trip.status === 'in_progress' ? 'En curso' :
                       trip.status === 'cancelled' ? 'Cancelado' :
                       'Programado'}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Programado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>En curso</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          <span>Completado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>Cancelado</span>
        </div>
      </div>
    </div>
  );
}
