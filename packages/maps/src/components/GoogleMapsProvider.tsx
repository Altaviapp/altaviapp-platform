"use client";

import { useJsApiLoader, Libraries } from "@react-google-maps/api";
import { createContext, useContext, ReactNode } from "react";
import { MAPS_CONFIG } from "../config/maps-config";

type GoogleMapsContextType = {
  isLoaded: boolean;
  loadError: Error | undefined;
};

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: undefined,
});

export function useGoogleMapsContext() {
  return useContext(GoogleMapsContext);
}

type GoogleMapsProviderProps = {
  children: ReactNode;
  apiKey?: string;
};

// Define libraries outside component to prevent re-renders
const libraries: Libraries = [...MAPS_CONFIG.libraries];

export function GoogleMapsProvider({ children, apiKey }: GoogleMapsProviderProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
    language: MAPS_CONFIG.language,
    region: MAPS_CONFIG.region,
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

// Loading component for when maps are loading
export function MapsLoadingState() {
  return (
    <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
        <p className="text-sm text-gray-500">Cargando mapa...</p>
      </div>
    </div>
  );
}

// Error component for when maps fail to load
export function MapsErrorState({ error }: { error?: Error }) {
  return (
    <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg border border-red-200">
      <div className="text-center p-4">
        <p className="text-red-600 font-medium">Error al cargar el mapa</p>
        <p className="text-sm text-red-500 mt-1">
          {error?.message || "Verifique su conexión a internet"}
        </p>
      </div>
    </div>
  );
}
