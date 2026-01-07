'use client';

import { useState, useCallback } from 'react';
import {
  MonitoringSidebar,
  TripListPanel,
  TripDetailPanel,
  MonitoringMap,
} from '@/components/monitoring';
import {
  useActiveTripsWithGPS,
  useTripMonitoring,
} from '@/hooks';

/**
 * Real-time Monitoring Page
 *
 * Full-screen map showing all active vehicles with a collapsible sidebar.
 * Sidebar shows trip list or trip details when selected.
 *
 * Features:
 * - All active trips with GPS shown on map
 * - Click trip in list or marker to view details
 * - Trip details with tabs: Info, Novedades, Timeline
 * - Zoom to vehicle and show route when trip selected
 */
export default function MonitoringPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // Get all active trips with GPS positions
  const { trips, isLoading: tripsLoading } = useActiveTripsWithGPS();

  // Get details for selected trip
  const {
    trip,
    route,
    vehicle,
    driver,
    monitor,
    stops,
    polyline,
    encodedPolyline,
    stats,
    timeline,
    novedades,
    pendingNovedadesCount,
    isLoading: detailsLoading,
  } = useTripMonitoring(selectedTripId);

  const handleSelectTrip = useCallback((tripId: string | null) => {
    setSelectedTripId(tripId);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedTripId(null);
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  // Get sidebar title
  const sidebarTitle = selectedTripId
    ? route?.name || 'Detalles del viaje'
    : `Viajes Activos (${trips.length})`;

  return (
    <div className="fixed inset-0 bg-gray-100">
      {/* Full-screen Map */}
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
          right: sidebarCollapsed ? '48px' : '400px',
        }}
      >
        <MonitoringMap
          trips={trips}
          selectedTripId={selectedTripId}
          selectedTripStops={stops}
          selectedTripPolyline={polyline}
          selectedTripEncodedPolyline={encodedPolyline}
          onSelectTrip={handleSelectTrip}
          sidebarCollapsed={sidebarCollapsed}
        />
      </div>

      {/* Sidebar */}
      <MonitoringSidebar
        title={sidebarTitle}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      >
        {selectedTripId ? (
          <TripDetailPanel
            trip={trip}
            route={route}
            vehicle={vehicle}
            driver={driver}
            monitor={monitor}
            stops={stops}
            stats={stats}
            timeline={timeline}
            novedades={novedades}
            pendingNovedadesCount={pendingNovedadesCount}
            isLoading={detailsLoading}
            onBack={handleBackToList}
          />
        ) : (
          <TripListPanel
            trips={trips}
            isLoading={tripsLoading}
            selectedTripId={selectedTripId}
            onSelectTrip={handleSelectTrip}
          />
        )}
      </MonitoringSidebar>
    </div>
  );
}
