/**
 * Next.js Middleware for Route Protection
 *
 * Uses Clerk for authentication and route protection
 * Protects all routes except public ones (sign-in, sign-up, landing page)
 */

import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/health",
  ],

  // Routes that should be ignored by the middleware
  ignoredRoutes: [
    "/api/webhooks(.*)",
    "/_next(.*)",
    "/favicon.ico",
  ],

  // After authentication, redirect to dashboard
  afterAuth(auth, req) {
    // If user is not authenticated and trying to access protected route
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return Response.redirect(signInUrl);
    }

    // If user is authenticated and trying to access sign-in/sign-up
    if (auth.userId && (req.nextUrl.pathname === "/sign-in" || req.nextUrl.pathname === "/sign-up")) {
      const dashboardUrl = new URL("/dashboard", req.url);
      return Response.redirect(dashboardUrl);
    }

    // Allow the request to proceed
    return;
  },
});

export const config = {
  matcher: [
    // Match all routes except static files and _next
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
