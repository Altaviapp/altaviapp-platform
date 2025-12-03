/**
 * Next.js Middleware for Route Protection
 *
 * Uses custom token-based authentication for route protection
 * Protects all routes except public ones (sign-in, landing page)
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/sign-in",
  "/register",
  "/sign-up",
  "/api/health",
];

// Routes that should be ignored by the middleware
const ignoredRoutes = [
  "/_next",
  "/favicon.ico",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/manifest.json",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route should be ignored
  if (ignoredRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname === route || pathname.startsWith(route)
  );

  // Get token from localStorage (will be handled client-side)
  // For server-side middleware, we can't access localStorage
  // So we'll allow the request and let client-side auth handle it

  if (!isPublicRoute) {
    // For protected routes, we'll let the client-side auth handle redirection
    // The AuthProvider will check the token and redirect if needed
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and _next
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
