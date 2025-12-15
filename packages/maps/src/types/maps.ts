/**
 * Type definitions for Google Maps integration
 */

export type LatLng = {
  lat: number;
  lng: number;
};

export type RouteStop = {
  id: string;
  name: string;
  address: string;
  position: LatLng;
  order: number;
  scheduledTime?: string;
  geofenceRadius?: number;
  studentCount?: number;
};

export type StudentLocation = {
  id: string;
  name: string;
  position: LatLng;
  address: string;
  assignedStopId?: string;
};

export type OptimizationResult = {
  optimizedOrder: number[];
  totalDistance: string;
  totalDuration: string;
  legs: {
    distance: string;
    duration: string;
    startAddress: string;
    endAddress: string;
  }[];
};

export type GeocodingResult = {
  address: string;
  position: LatLng;
  placeId?: string;
};

export type DirectionsResult = {
  polyline: LatLng[];
  distance: string;
  duration: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
};

export type MarkerType = "stop" | "student" | "vehicle" | "school";

export type MarkerInfo = {
  id: string;
  type: MarkerType;
  position: LatLng;
  label?: string;
  title?: string;
  draggable?: boolean;
};
