"use client";

import { useRef, useEffect, useState } from "react";
import { MAPS_CONFIG } from "../config/maps-config";
import { useGoogleMapsContext } from "./GoogleMapsProvider";
import type { LatLng } from "../types/maps";

type AddressAutocompleteProps = {
  value?: string;
  onChange?: (value: string) => void;
  onPlaceSelect?: (place: { address: string; position: LatLng }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function AddressAutocomplete({
  value = "",
  onChange,
  onPlaceSelect,
  placeholder = "Buscar dirección...",
  className = "",
  disabled = false,
}: AddressAutocompleteProps) {
  const { isLoaded } = useGoogleMapsContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) {
      return;
    }

    // Initialize autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: MAPS_CONFIG.countryRestriction,
      fields: ["formatted_address", "geometry", "place_id"],
      types: ["geocode", "establishment"],
    });

    // Handle place selection
    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();

      if (place?.geometry?.location) {
        const address = place.formatted_address || "";
        const position: LatLng = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        setInputValue(address);
        onChange?.(address);
        onPlaceSelect?.({ address, position });
      }
    });

    return () => {
      // Cleanup is handled by Google Maps API
    };
  }, [isLoaded, onChange, onPlaceSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  if (!isLoaded) {
    return (
      <input
        type="text"
        placeholder="Cargando..."
        disabled
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 ${className}`}
      />
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={handleInputChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${className}`}
    />
  );
}
