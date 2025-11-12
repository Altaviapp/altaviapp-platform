/**
 * Clerk Authentication Configuration for Convex
 *
 * This file configures Convex to use Clerk for authentication.
 * The Clerk JWT will be validated on the Convex backend.
 *
 * Setup Instructions:
 * 1. Go to Clerk Dashboard > Configure > JWT Templates
 * 2. Create a new template named "convex"
 * 3. Copy the Issuer URL (looks like: https://your-domain.clerk.accounts.dev)
 * 4. Set CLERK_JWT_ISSUER_DOMAIN in Convex dashboard environment variables
 *
 * For development without Clerk, comment out the providers array below.
 */

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
