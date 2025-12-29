'use client';

import { useState, useMemo } from 'react';
import { Bus } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/core';
import { PageHeader, StatsGrid, type StatItem } from '@/components/shared';
import {
  TripCalendarTabs,
  TripFilters,
  TripDayView,
  TripWeekView,
  TripMonthView,
  type CalendarView,
  type ProjectedTripData,
} from '@/components/trips';
import {
  useProjectedTrips,
  useProjectedTripsCount,
  getDateRange,
} from '@/hooks';
import { Id } from '../../../../../../convex/_generated/dataModel';

/**
 * Trips Page - Calendar View
 *
 * Shows projected and actual trips in day/week/month views
 * with filtering by vehicle, driver, and student
 */

export default function TripsPage() {
  // Calendar state
  const [view, setView] = useState<CalendarView>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Filter state
  const [vehicleId, setVehicleId] = useState<Id<"vehicles"> | undefined>();
  const [driverId, setDriverId] = useState<Id<"drivers"> | undefined>();
  const [studentSearch, setStudentSearch] = useState('');

  // Calculate date range based on view
  const { startDate, endDate } = useMemo(() => {
    return getDateRange(view, selectedDate);
  }, [view, selectedDate]);

  // Get month/year for month view
  const monthYear = useMemo(() => ({
    year: selectedDate.getFullYear(),
    month: selectedDate.getMonth() + 1,
  }), [selectedDate]);

  // Fetch projected trips for day/week views
  const { trips, groupedByDate, isLoading: tripsLoading } = useProjectedTrips({
    startDate,
    endDate,
    vehicleId,
    driverId,
    studentSearch,
  });

  // Fetch trip counts for month view
  const { countByDay, isLoading: countsLoading } = useProjectedTripsCount(
    monthYear.year,
    monthYear.month
  );

  // Calculate stats
  const stats: StatItem[] = useMemo(() => {
    const total = trips.length;
    const active = trips.filter((t) => t.status === 'in_progress').length;
    const completed = trips.filter((t) => t.status === 'completed').length;
    const projected = trips.filter((t) => t.status === 'projected').length;

    return [
      { label: 'Total Viajes', value: total, icon: Bus, color: 'default' },
      { label: 'En Curso', value: active, icon: Bus, color: 'success' },
      { label: 'Completados', value: completed, icon: Bus, color: 'info' },
      { label: 'Proyectados', value: projected, icon: Bus, color: 'warning' },
    ];
  }, [trips]);

  // Handlers
  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setView('day');
  };

  const handleWeekChange = (weekStart: Date) => {
    setSelectedDate(weekStart);
  };

  const handleMonthChange = (year: number, month: number) => {
    setSelectedDate(new Date(year, month - 1, 1));
  };

  const handleClearFilters = () => {
    setVehicleId(undefined);
    setDriverId(undefined);
    setStudentSearch('');
  };

  const handleTripClick = (trip: ProjectedTripData) => {
    // TODO: Open trip detail modal or navigate to trip page
    console.log('Trip clicked:', trip);
  };

  // Get week start for week view
  const weekStart = useMemo(() => {
    const start = new Date(selectedDate);
    start.setDate(selectedDate.getDate() - selectedDate.getDay());
    return start;
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Gestion de Viajes"
        subtitle="Calendario de viajes proyectados y activos"
      />

      {/* Stats */}
      <StatsGrid
        stats={stats}
        isLoading={view !== 'month' ? tripsLoading : countsLoading}
        columns={4}
      />

      {/* Filters */}
      <TripFilters
        vehicleId={vehicleId}
        driverId={driverId}
        studentSearch={studentSearch}
        onVehicleChange={setVehicleId}
        onDriverChange={setDriverId}
        onStudentSearchChange={setStudentSearch}
        onClearFilters={handleClearFilters}
      />

      {/* Calendar Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Calendario</h2>
            <TripCalendarTabs activeView={view} onViewChange={handleViewChange} />
          </div>
        </CardHeader>
        <CardContent>
          {view === 'day' && (
            <TripDayView
              date={selectedDate}
              trips={trips}
              isLoading={tripsLoading}
              onDateChange={handleDateChange}
              onTripClick={handleTripClick}
            />
          )}

          {view === 'week' && (
            <TripWeekView
              weekStart={weekStart}
              tripsByDate={groupedByDate}
              isLoading={tripsLoading}
              onWeekChange={handleWeekChange}
              onDayClick={handleDayClick}
              onTripClick={handleTripClick}
            />
          )}

          {view === 'month' && (
            <TripMonthView
              year={monthYear.year}
              month={monthYear.month}
              countByDay={countByDay}
              isLoading={countsLoading}
              onMonthChange={handleMonthChange}
              onDayClick={handleDayClick}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
