/**
 * HTTP Endpoints and Webhooks
 *
 * Handles:
 * - Clerk user sync webhooks
 * - REST API endpoints for Bubble.io integration
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

/**
 * Clerk Webhook Handler
 *
 * Syncs user data from Clerk to Convex database
 * Webhook URL: https://your-deployment.convex.site/clerk-webhook
 *
 * To set up in Clerk Dashboard:
 * 1. Go to Webhooks section
 * 2. Add endpoint: https://your-deployment.convex.site/clerk-webhook
 * 3. Subscribe to: user.created, user.updated, user.deleted
 * 4. Copy signing secret to CLERK_WEBHOOK_SECRET env var
 */
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await request.json();
      const eventType = payload.type;

      console.log("Clerk webhook received:", eventType);

      switch (eventType) {
        case "user.created":
        case "user.updated": {
          const { id, email_addresses, first_name, last_name } = payload.data;

          // Get primary email
          const primaryEmail = email_addresses.find(
            (email: any) => email.id === payload.data.primary_email_address_id
          );

          if (!primaryEmail) {
            return new Response(
              JSON.stringify({ error: "No primary email found" }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          // Sync user to Convex
          const result = await ctx.runMutation(internal.users.syncUserFromClerk, {
            clerkId: id,
            email: primaryEmail.email_address,
            name: `${first_name || ""} ${last_name || ""}`.trim() || primaryEmail.email_address,
          });

          console.log("User synced:", result);

          return new Response(
            JSON.stringify({ success: true, ...result }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        case "user.deleted": {
          const { id } = payload.data;

          await ctx.runMutation(internal.users.deleteUserFromClerk, {
            clerkId: id,
          });

          return new Response(
            JSON.stringify({ success: true, message: "User deleted" }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        default:
          console.log("Unhandled webhook event:", eventType);
          return new Response(
            JSON.stringify({ message: "Event type not handled" }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
      }
    } catch (error: any) {
      console.error("Clerk webhook error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

/**
 * Health check endpoint
 */
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "Altaviapp Convex Backend",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

/**
 * API Info endpoint
 */
http.route({
  path: "/api",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({
        name: "Altaviapp API",
        version: "1.0.0",
        description: "School transport management platform API",
        endpoints: {
          health: "/health",
          clerkWebhook: "/clerk-webhook",
        },
        documentation: "https://github.com/your-repo/docs/api",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

export default http;
