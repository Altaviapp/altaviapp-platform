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
 * INVITATIONS ENDPOINTS
 */

/**
 * Create individual invitation
 * POST /invitations/create
 * Body: { userId, institutionId, email, firstName?, lastName?, phone?, role }
 */
http.route({
  path: "/invitations/create",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await ctx.runMutation(api.invitations.createInvitation, body);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }),
});

/**
 * Create bulk invitations (CSV import)
 * POST /invitations/create-bulk
 * Body: { userId, institutionId, invitations: [{ email, firstName?, lastName?, phone?, role }] }
 */
http.route({
  path: "/invitations/create-bulk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await ctx.runMutation(api.invitations.createBulkInvitations, body);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }),
});

/**
 * Verify invitation code
 * GET /invitations/verify?code=12345678
 */
http.route({
  path: "/invitations/verify",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const code = url.searchParams.get("code");
      if (!code) throw new Error("Missing invitation code");

      const result = await ctx.runQuery(api.invitations.verifyInvitationCode, {
        invitationCode: code,
      });
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }),
});

/**
 * Accept invitation (create user account)
 * POST /invitations/accept
 */
http.route({
  path: "/invitations/accept",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await ctx.runMutation(api.invitations.acceptInvitation, body);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }),
});

/**
 * List invitations
 * GET /invitations/list?userId=xxx&institutionId=xxx&status=pending
 */
http.route({
  path: "/invitations/list",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get("userId");
      const institutionId = url.searchParams.get("institutionId");
      const status = url.searchParams.get("status") as any;

      if (!userId) throw new Error("Missing userId");
      if (!institutionId) throw new Error("Missing institutionId");

      const result = await ctx.runQuery(api.invitations.listInvitations, {
        userId,
        institutionId,
        status,
      });
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }),
});

/**
 * Cancel invitation
 * POST /invitations/cancel
 * Body: { userId, invitationId }
 */
http.route({
  path: "/invitations/cancel",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await ctx.runMutation(api.invitations.cancelInvitation, body);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }),
});

/**
 * EMAIL VERIFICATION ENDPOINTS
 */

/**
 * Verify email with token
 * POST /auth/verify-email
 */
http.route({
  path: "/auth/verify-email",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await ctx.runMutation(api.emailVerification.verifyEmailToken, body);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }),
});

/**
 * Resend verification email
 * POST /auth/resend-verification
 */
http.route({
  path: "/auth/resend-verification",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await ctx.runMutation(api.emailVerification.resendVerificationEmail, body);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }),
});

/**
 * CLIENT MANAGEMENT ENDPOINTS
 */

/**
 * Create client
 * POST /clients/create
 * Body: { userId, name, contactEmail, contactPhone, address, city, province, ... }
 */
http.route({
  path: "/clients/create",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await ctx.runMutation(api.clients.createClient, body);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }),
});

/**
 * Update client
 * PUT /clients/update
 * Body: { userId, clientId, name?, contactEmail?, ... }
 */
http.route({
  path: "/clients/update",
  method: "PUT",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await ctx.runMutation(api.clients.updateClient, body);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }),
});

/**
 * Get client
 * GET /clients/get?userId=xxx&clientId=xxx
 */
http.route({
  path: "/clients/get",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get("userId");
      const clientId = url.searchParams.get("clientId");

      if (!userId) throw new Error("Missing userId");
      if (!clientId) throw new Error("Missing clientId");

      const result = await ctx.runQuery(api.clients.getClient, { userId, clientId });
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }),
});

/**
 * List clients
 * GET /clients/list?userId=xxx&subscriptionStatus=active&isActive=true
 */
http.route({
  path: "/clients/list",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get("userId");
      const subscriptionStatus = url.searchParams.get("subscriptionStatus") as any;
      const isActiveParam = url.searchParams.get("isActive");
      const isActive = isActiveParam ? isActiveParam === "true" : undefined;

      if (!userId) throw new Error("Missing userId");

      const result = await ctx.runQuery(api.clients.listClients, {
        userId,
        subscriptionStatus,
        isActive,
      });
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
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
