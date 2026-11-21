// Avisos dentro de la app y suscripciones push.
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/db/client";
import * as t from "@/db/schema";
import { noArgs, userMutation, userQuery } from "./core";

export const mine = userQuery(noArgs, async (ctx) => {
  ctx.watch(`notif:${ctx.user.id}`);
  const rows = await ctx.db.select().from(t.notifications).where(eq(t.notifications.userId, ctx.user.id)).orderBy(desc(t.notifications.at)).limit(50);
  const subscribed = await ctx.db.select({ id: t.pushSubscriptions.id }).from(t.pushSubscriptions).where(eq(t.pushSubscriptions.userId, ctx.user.id)).limit(1);
  return {
    unread: rows.filter((n) => !n.read).length,
    pushOn: subscribed.length > 0,
    items: rows.map((n) => ({ id: n.id, title: n.title, body: n.body, tripId: n.tripId ?? undefined, read: n.read, at: n.at })),
  };
});

export const readAll = userMutation(noArgs, async (ctx) => {
  await ctx.db.update(t.notifications).set({ read: true }).where(and(eq(t.notifications.userId, ctx.user.id), eq(t.notifications.read, false)));
  ctx.touch(`notif:${ctx.user.id}`);
  return null;
});

export const subscribe = userMutation(
  z.object({ endpoint: z.url().max(1000), p256dh: z.string().max(200), auth: z.string().max(100) }),
  async (ctx, sub) => {
    if (!sub.endpoint.startsWith("https://")) return null;
    await ctx.db
      .insert(t.pushSubscriptions)
      .values({ ...sub, userId: ctx.user.id })
      .onConflictDoUpdate({ target: t.pushSubscriptions.endpoint, set: { userId: ctx.user.id, p256dh: sub.p256dh, auth: sub.auth } });
    ctx.touch(`notif:${ctx.user.id}`);
    return null;
  },
);

export const unsubscribe = userMutation(z.object({ endpoint: z.string().max(1000) }), async (ctx, { endpoint }) => {
  await ctx.db.delete(t.pushSubscriptions).where(and(eq(t.pushSubscriptions.endpoint, endpoint), eq(t.pushSubscriptions.userId, ctx.user.id)));
  ctx.touch(`notif:${ctx.user.id}`);
  return null;
});

/** Envío de Web Push (tarea en cola). Sin llaves VAPID no hace nada: los avisos quedan en la app. */
export async function sendPush(db: Db, payload: { userIds: string[]; title: string; body: string }) {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey || !payload.userIds.length) return;
  const { sendNotification } = await import("web-push");
  const vapidDetails = { subject: process.env.VAPID_SUBJECT ?? "mailto:soporte@example.com", publicKey, privateKey };
  const subs = await db.select().from(t.pushSubscriptions).where(inArray(t.pushSubscriptions.userId, payload.userIds));
  const gone: string[] = [];
  await Promise.all(
    subs.map(async (s) => {
      try {
        await sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title: payload.title, body: payload.body }),
          { TTL: 600, vapidDetails },
        );
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        // 404/410: el navegador ya no tiene esa suscripción.
        if (status === 404 || status === 410) gone.push(s.id);
        else console.error(`Push falló (${status ?? (error as Error).message})`);
      }
    }),
  );
  if (gone.length) await db.delete(t.pushSubscriptions).where(inArray(t.pushSubscriptions.id, gone));
}
