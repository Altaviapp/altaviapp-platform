"use node";
// Envío de Web Push. Sin llaves VAPID configuradas no hace nada (los avisos quedan en la app).
import { v } from "convex/values";
import { sendNotification } from "web-push";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

export const send = internalAction({
  args: { userIds: v.array(v.id("users")), title: v.string(), body: v.string() },
  handler: async (ctx, { userIds, title, body }) => {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    if (!publicKey || !privateKey) return;
    const vapidDetails = {
      subject: process.env.VAPID_SUBJECT ?? "mailto:soporte@example.com",
      publicKey,
      privateKey,
    };
    const subs = await ctx.runQuery(internal.notifications.subscriptionsFor, { userIds });
    await Promise.all(
      subs.map(async (s) => {
        try {
          await sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            JSON.stringify({ title, body }),
            { TTL: 600, vapidDetails },
          );
        } catch (error) {
          const status = (error as { statusCode?: number }).statusCode;
          // 404/410: el navegador ya no tiene esa suscripción.
          if (status === 404 || status === 410) {
            await ctx.runMutation(internal.notifications.dropSubscription, { id: s._id });
          } else {
            console.error(`Push falló (${status ?? (error as Error).message})`);
          }
        }
      }),
    );
  },
});
