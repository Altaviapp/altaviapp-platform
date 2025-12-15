/**
 * Google Maps Configuration for Altaviapp
 *
 * Default settings for Ecuador/Quito with Spanish language
 */

export const MAPS_CONFIG = {
  // Default center: Quito, Ecuador
  defaultCenter: {
    lat: -0.1807,
    lng: -78.4678,
  },

  // Default zoom level (city view)
  defaultZoom: 12,

  // Detailed zoom for route view
  routeZoom: 14,

  // Language and region
  language: "es",
  region: "EC",

  // Libraries to load
  libraries: ["places", "geometry"] as const,

  // Country restriction for Places API
  countryRestriction: {
    country: "ec",
  },

  // Geofence defaults
  defaultGeofenceRadius: 100, // meters

  // Map styles (optional - Altaviapp brand colors)
  mapStyles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ] as google.maps.MapTypeStyle[],
};

// School location for demo (Colegio Demo La Carolina)
export const DEMO_SCHOOL_LOCATION = {
  lat: -0.1828,
  lng: -78.4847,
};

// Map bounds for Quito area (to restrict map view)
export const QUITO_BOUNDS = {
  north: -0.05,
  south: -0.35,
  east: -78.35,
  west: -78.60,
};

export type LatLng = {
  lat: number;
  lng: number;
};

export type MapLibrary = (typeof MAPS_CONFIG.libraries)[number];
