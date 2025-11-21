/**
 * HTTP Endpoints and Webhooks
 *
 * Handles:
 * - REST API endpoints for Bubble.io integration
 * - Custom authentication
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

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
