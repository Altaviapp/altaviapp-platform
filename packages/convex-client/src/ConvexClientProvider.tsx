"use client";

/**
 * Convex Client Provider
 *
 * Wraps the app with ConvexProvider for Convex React hooks.
 * Automatically detects the Convex URL from environment variables.
 *
 * @package @altaviapp/convex-client
 */

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

interface ConvexClientProviderProps {
  children: ReactNode;
  /** Override the Convex URL (optional, auto-detected from env) */
  convexUrl?: string;
}

/**
 * Get Convex URL from environment variables
 * Supports both Next.js and Vite environments
 */
function getConvexUrl(): string {
  // Next.js
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_CONVEX_URL) {
    return process.env.NEXT_PUBLIC_CONVEX_URL;
  }

  // Vite
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_CONVEX_URL) {
    return (import.meta as any).env.VITE_CONVEX_URL;
  }

  throw new Error(
    "Missing Convex URL. Set NEXT_PUBLIC_CONVEX_URL or VITE_CONVEX_URL environment variable."
  );
}

export function ConvexClientProvider({
  children,
  convexUrl,
}: ConvexClientProviderProps) {
  const client = useMemo(() => {
    const url = convexUrl || getConvexUrl();
    return new ConvexReactClient(url);
  }, [convexUrl]);

  return (
    <ConvexProvider client={client}>
      {children}
    </ConvexProvider>
  );
}
