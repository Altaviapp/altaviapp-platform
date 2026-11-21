// Avisos dentro de la app y suscripciones push.
import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { userMutation, userQuery } from "./lib";

export const mine = userQuery({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .order("desc")
      .take(50);
    const subscribed = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .first();
    return {
      unread: rows.filter((n) => !n.read).length,
      pushOn: !!subscribed,
      items: rows.map((n) => ({ _id: n._id, title: n.title, body: n.body, tripId: n.tripId, read: n.read, at: n.at })),
    };
  },
});

export const readAll = userMutation({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .order("desc")
      .take(100);
    for (const n of rows) if (!n.read) await ctx.db.patch(n._id, { read: true });
    return null;
  },
});

export const subscribe = userMutation({
  args: { endpoint: v.string(), p256dh: v.string(), auth: v.string() },
  handler: async (ctx, sub) => {
    if (!sub.endpoint.startsWith("https://") || sub.endpoint.length > 1000) return null;
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", sub.endpoint))
      .unique();
    if (existing) await ctx.db.replace(existing._id, { ...sub, userId: ctx.user._id });
    else await ctx.db.insert("pushSubscriptions", { ...sub, userId: ctx.user._id });
    return null;
  },
});

export const unsubscribe = userMutation({
  args: { endpoint: v.string() },
  handler: async (ctx, { endpoint }) => {
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", endpoint))
      .unique();
    if (existing?.userId === ctx.user._id) await ctx.db.delete(existing._id);
    return null;
  },
});

export const subscriptionsFor = internalQuery({
  args: { userIds: v.array(v.id("users")) },
  handler: async (ctx, { userIds }) => {
    const all = await Promise.all(
      userIds.map((userId) =>
        ctx.db.query("pushSubscriptions").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ),
    );
    return all.flat().map((s) => ({ _id: s._id, endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth }));
  },
});

export const dropSubscription = internalMutation({
  args: { id: v.id("pushSubscriptions") },
  handler: async (ctx, { id }) => {
    if (await ctx.db.get(id)) await ctx.db.delete(id);
  },
});
