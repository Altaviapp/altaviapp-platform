/**
 * Geocoding Service
 *
 * Converts addresses to coordinates and vice versa
 * with caching and Ecuador restrictions
 */

import { MAPS_CONFIG } from "../config/maps-config";
import type { LatLng, GeocodingResult } from "../types/maps";

// Simple in-memory cache (for browser session)
const geocodeCache = new Map<string, GeocodingResult>();

/**
 * Convert address to coordinates (geocode)
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  // Check cache first
  const cacheKey = address.toLowerCase().trim();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    const geocoder = new google.maps.Geocoder();

    const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      geocoder.geocode(
        {
          address,
          // No country restriction - address comes from autocomplete which already filters
          region: MAPS_CONFIG.region,
        },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        }
      );
    });

    const firstResult = result[0];
    if (firstResult) {
      const location = firstResult.geometry.location;
      const geocodingResult: GeocodingResult = {
        address: firstResult.formatted_address,
        position: {
          lat: location.lat(),
          lng: location.lng(),
        },
        placeId: firstResult.place_id,
      };

      // Cache the result
      geocodeCache.set(cacheKey, geocodingResult);
      return geocodingResult;
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Convert coordinates to address (reverse geocode)
 */
export async function reverseGeocode(position: LatLng): Promise<string | null> {
  try {
    const geocoder = new google.maps.Geocoder();

    const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      geocoder.geocode(
        {
          location: position,
        },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results) {
            resolve(results);
          } else {
            reject(new Error(`Reverse geocoding failed: ${status}`));
          }
        }
      );
    });

    // Return the most specific address (usually the first result)
    const firstResult = result[0];
    if (firstResult) {
      return firstResult.formatted_address;
    }

    return null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

/**
 * Clear the geocoding cache
 */
export function clearGeocodeCache(): void {
  geocodeCache.clear();
}
