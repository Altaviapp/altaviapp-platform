/**
 * HTTP Endpoints and Webhooks
 *
 * Handles:
 * - Clerk user sync webhooks
 * - REST API endpoints for Bubble.io integration
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal, api } from "./_generated/api";

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
          auth: {
            register: "POST /auth/register",
            login: "POST /auth/login",
            me: "GET /auth/me",
            logout: "POST /auth/logout",
          },
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

/**
 * Authentication Endpoints for Bubble.io
 */

/**
 * Register new user
 * POST /auth/register
 *
 * Body: {email, password, name, phone?, role?, institutionId?}
 */
http.route({
  path: "/auth/register",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.authApi.register, {
        email: body.email,
        password: body.password,
        name: body.name,
        phone: body.phone,
        role: body.role,
        institutionId: body.institutionId,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * Login user
 * POST /auth/login
 *
 * Body: {email, password}
 */
http.route({
  path: "/auth/login",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.authApi.login, {
        email: body.email,
        password: body.password,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * Get current user
 * GET /auth/me
 *
 * Headers: Authorization: Bearer <token>
 * OR Query: ?token=<token>
 */
http.route({
  path: "/auth/me",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      // Get token from Authorization header or query parameter
      const authHeader = request.headers.get("Authorization");
      const url = new URL(request.url);
      const queryToken = url.searchParams.get("token");

      let token = "";

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      } else if (queryToken) {
        token = queryToken;
      } else {
        throw new Error("No token provided");
      }

      const result = await ctx.runQuery(api.authApi.me, {
        token,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * Logout user
 * POST /auth/logout
 *
 * Body: {token}
 */
http.route({
  path: "/auth/logout",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.authApi.logout, {
        token: body.token,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

export default http;
