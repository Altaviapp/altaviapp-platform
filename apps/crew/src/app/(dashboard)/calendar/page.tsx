'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sunrise, Sunset, CheckCircle, Clock, XCircle, Bus, Play, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCalendarTrips } from '@/hooks';
import { LoadingState, Card, Badge, Button } from '@/components/core';
import { PageHeader } from '@/components/shared';
import { TRIP_STATUS_CONFIG } from '@/lib/constants';

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

export default function CalendarPage() {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0]!;
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(todayString);

  const { trips, tripsByDate, isLoading } = useCalendarTrips(currentYear, currentMonth);

  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(todayString);
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(todayString);
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
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    calendarDays.push({
      day,
      date: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      isCurrentMonth: false,
    });
  }

  const selectedTrips = tripsByDate[selectedDate] || [];
  const isSelectedToday = selectedDate === todayString;

  if (isLoading) {
    return <LoadingState message="Cargando calendario..." size="lg" />;
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <PageHeader
        title="Calendario"
        subtitle={`${trips.length} viaje${trips.length !== 1 ? 's' : ''} en ${monthNames[currentMonth - 1]}`}
        actions={[{ label: 'Hoy', onClick: goToToday, variant: 'secondary' }]}
      />

      {/* Month Navigation */}
      <Card padding="sm">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[currentMonth - 1]} {currentYear}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </Card>

      {/* Calendar Grid */}
      <Card padding="none">
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

                {hasTrips && (
                  <div className="flex gap-1 mt-1">
                    {dayTrips.slice(0, 3).map((trip, i) => {
                      const config = TRIP_STATUS_CONFIG[trip.status as keyof typeof TRIP_STATUS_CONFIG];
                      return (
                        <div
                          key={i}
                          className={cn('w-2 h-2 rounded-full', config?.dotColor || 'bg-gray-400')}
                        />
                      );
                    })}
                    {dayTrips.length > 3 && (
                      <span className="text-xs text-gray-500">+{dayTrips.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Selected Date Trips */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isSelectedToday ? 'Viajes de Hoy' : `Viajes del ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-EC', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}`}
        </h3>

        {selectedTrips.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay viajes para este dia</p>
        ) : (
          <div className="space-y-3">
            {selectedTrips.map((trip) => {
              const isPickup = trip.routeType === 'pickup';
              const TypeIcon = isPickup ? Sunrise : Sunset;
              const statusConfig = TRIP_STATUS_CONFIG[trip.status as keyof typeof TRIP_STATUS_CONFIG];
              const canStart = trip.status === 'scheduled' && isSelectedToday;
              const isActive = trip.status === 'in_progress';

              return (
                <div
                  key={trip._id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 min-h-[56px]"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    isPickup ? 'bg-yellow-100' : 'bg-blue-100'
                  )}>
                    <TypeIcon className={cn('w-5 h-5', isPickup ? 'text-yellow-600' : 'text-blue-600')} />
                  </div>
                  <Link href={`/trips/${trip._id}`} className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {trip.routeName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isPickup ? 'Recogida' : 'Entrega'}
                    </p>
                  </Link>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={statusConfig?.variant || 'default'} size="sm" dot>
                      {statusConfig?.label || trip.status}
                    </Badge>
                    {canStart && (
                      <Link href={`/trips/${trip._id}/start`}>
                        <Button variant="primary" size="sm" leftIcon={Play}>
                          Iniciar
                        </Button>
                      </Link>
                    )}
                    {isActive && (
                      <Link href={`/trips/${trip._id}/active`}>
                        <Button variant="primary" size="sm" leftIcon={Eye}>
                          Ver
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
        {Object.entries(TRIP_STATUS_CONFIG).map(([key, config]) => (
          <div key={key} className="flex items-center gap-1">
            <div className={cn('w-2 h-2 rounded-full', config.dotColor)} />
            <span>{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
