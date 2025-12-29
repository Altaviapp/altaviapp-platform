"use client";

import { useState, useCallback, useEffect } from "react";
import { InteractiveMap } from "./InteractiveMap";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { useGoogleMapsContext, MapsLoadingState, MapsErrorState } from "./GoogleMapsProvider";
import { reverseGeocode } from "../services/geocoding";
import { useGeolocation } from "../hooks/useGeolocation";
import { MAPS_CONFIG } from "../config/maps-config";
import type { LatLng, MarkerInfo } from "../types/maps";

export type LocationPickerProps = {
  /** Initial position for the marker */
  initialPosition?: LatLng;
  /** Initial address to display */
  initialAddress?: string;
  /** Callback when location is selected */
  onLocationSelect: (location: { position: LatLng; address: string }) => void;
  /** Placeholder text for the address input */
  placeholder?: string;
  /** Additional class names for the container */
  className?: string;
  /** Height of the map */
  mapHeight?: string;
  /** Whether to show the address input */
  showAddressInput?: boolean;
  /** Label for the component */
  label?: string;
  /** Help text to display below the input */
  helpText?: string;
};

/**
 * LocationPicker Component
 *
 * A combined address search and map picker for selecting locations.
 * Supports:
 * - Address autocomplete search
 * - Click on map to select location
 * - Draggable marker
 * - Reverse geocoding to get address from coordinates
 */
export function LocationPicker({
  initialPosition,
  initialAddress = "",
  onLocationSelect,
  placeholder = "Buscar dirección o hacer clic en el mapa...",
  className = "",
  mapHeight = "300px",
  showAddressInput = true,
  label,
  helpText,
}: LocationPickerProps) {
  const { isLoaded, loadError } = useGoogleMapsContext();
  const [position, setPosition] = useState<LatLng | undefined>(initialPosition);
  const [address, setAddress] = useState(initialAddress);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const { position: gpsPosition, loading: gpsLoading, error: gpsError, getCurrentPosition } = useGeolocation();

  // Handle GPS position when obtained
  useEffect(() => {
    if (gpsPosition) {
      handleMapClick(gpsPosition);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpsPosition]);

  // Update position when initialPosition changes
  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  // Update address when initialAddress changes
  useEffect(() => {
    setAddress(initialAddress);
  }, [initialAddress]);

  // Handle address selection from autocomplete
  const handlePlaceSelect = useCallback(
    (place: { address: string; position: LatLng }) => {
      setPosition(place.position);
      setAddress(place.address);
      onLocationSelect(place);
    },
    [onLocationSelect]
  );

  // Handle map click
  const handleMapClick = useCallback(
    async (clickedPosition: LatLng) => {
      setPosition(clickedPosition);
      setIsLoadingAddress(true);

      try {
        // Reverse geocode to get address
        const geocodedAddress = await reverseGeocode(clickedPosition);
        const finalAddress = geocodedAddress || `${clickedPosition.lat.toFixed(6)}, ${clickedPosition.lng.toFixed(6)}`;
        setAddress(finalAddress);
        onLocationSelect({ position: clickedPosition, address: finalAddress });
      } catch (error) {
        console.error("Error reverse geocoding:", error);
        // Use coordinates as fallback address
        const fallbackAddress = `${clickedPosition.lat.toFixed(6)}, ${clickedPosition.lng.toFixed(6)}`;
        setAddress(fallbackAddress);
        onLocationSelect({ position: clickedPosition, address: fallbackAddress });
      } finally {
        setIsLoadingAddress(false);
      }
    },
    [onLocationSelect]
  );

  // Handle marker drag end
  const handleMarkerDragEnd = useCallback(
    async (_markerId: string, newPosition: LatLng) => {
      setPosition(newPosition);
      setIsLoadingAddress(true);

      try {
        const geocodedAddress = await reverseGeocode(newPosition);
        const finalAddress = geocodedAddress || `${newPosition.lat.toFixed(6)}, ${newPosition.lng.toFixed(6)}`;
        setAddress(finalAddress);
        onLocationSelect({ position: newPosition, address: finalAddress });
      } catch (error) {
        console.error("Error reverse geocoding:", error);
        const fallbackAddress = `${newPosition.lat.toFixed(6)}, ${newPosition.lng.toFixed(6)}`;
        setAddress(fallbackAddress);
        onLocationSelect({ position: newPosition, address: fallbackAddress });
      } finally {
        setIsLoadingAddress(false);
      }
    },
    [onLocationSelect]
  );

  // Create marker for current position
  const markers: MarkerInfo[] = position
    ? [
        {
          id: "selected-location",
          position,
          type: "student",
          title: address || "Ubicación seleccionada",
          draggable: true,
        },
      ]
    : [];

  // Determine map center
  const mapCenter = position || MAPS_CONFIG.defaultCenter;

  if (loadError) {
    return <MapsErrorState error={loadError} />;
  }

  if (!isLoaded) {
    return <MapsLoadingState />;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {showAddressInput && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <AddressAutocomplete
              value={address}
              onChange={setAddress}
              onPlaceSelect={handlePlaceSelect}
              placeholder={placeholder}
              className={isLoadingAddress ? "pr-10" : ""}
            />
            {isLoadingAddress && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={getCurrentPosition}
            disabled={gpsLoading}
            title={gpsError || "Usar mi ubicación actual"}
            className={`flex-shrink-0 p-2.5 rounded-lg border transition-colors ${
              gpsError
                ? "border-red-300 bg-red-50 text-red-500"
                : gpsLoading
                ? "border-gray-300 bg-gray-100 text-gray-400 cursor-wait"
                : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:border-primary hover:text-primary"
            }`}
          >
            {gpsLoading ? (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
                />
              </svg>
            )}
          </button>
        </div>
      )}

      {helpText && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}

      <div className="rounded-lg overflow-hidden border border-gray-200">
        <InteractiveMap
          center={mapCenter}
          zoom={position ? 16 : MAPS_CONFIG.defaultZoom}
          markers={markers}
          onMapClick={handleMapClick}
          onMarkerDragEnd={handleMarkerDragEnd}
          style={{ height: mapHeight }}
        />
      </div>

      {position && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-medium">Ubicación seleccionada:</span>
          </div>
          <p className="mt-1 text-gray-700">{address}</p>
          <p className="text-xs text-gray-500 mt-1">
            Coordenadas: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}
