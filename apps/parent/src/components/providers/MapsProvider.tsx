'use client';

/**
 * Google Maps Provider for Parent App
 *
 * Wraps the application with Google Maps context.
 * API key is loaded from environment variable.
 */

import { ReactNode } from 'react';
import { GoogleMapsProvider } from '@altaviapp/maps';

interface MapsProviderProps {
  children: ReactNode;
}

export function MapsProvider({ children }: MapsProviderProps) {
  return (
    <GoogleMapsProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      {children}
    </GoogleMapsProvider>
  );
}
