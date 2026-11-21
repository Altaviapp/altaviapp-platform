// Reconocimiento facial. Al servidor solo llegan vectores numéricos calculados en el
// dispositivo; nunca fotos. Exige consentimiento y el acudiente puede retirarlo.
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";
import { isDescriptor } from "../lib/face";
import { driverQuery, fail, isGuardian, owned, userMutation } from "./lib";

async function canManage(ctx: QueryCtx & { user: Doc<"users"> }, studentId: Id<"students">) {
  await owned(ctx, studentId, ctx.user.schoolId);
  if (ctx.user.role === "admin") return "school" as const;
  if (ctx.user.role === "parent" && (await isGuardian(ctx, ctx.user._id, studentId))) {
    return "guardian" as const;
  }
  return fail("No tienes permiso para esto.");
}

export const enroll = userMutation({
  args: {
    studentId: v.id("students"),
    descriptors: v.array(v.array(v.number())),
    consent: v.literal(true), // quien registra declara contar con la autorización del acudiente
  },
  handler: async (ctx, { studentId, descriptors }) => {
    const consentSource = await canManage(ctx, studentId);
    if (descriptors.length < 1 || descriptors.length > 5 || !descriptors.every(isDescriptor)) {
      fail("No se pudo leer el rostro. Intenta de nuevo con buena luz.");
    }
    const existing = await ctx.db
      .query("faces")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .unique();
    const doc = { descriptors, consentBy: ctx.user._id, consentAt: Date.now(), consentSource };
    if (existing) await ctx.db.patch(existing._id, doc);
    else await ctx.db.insert("faces", { ...doc, schoolId: ctx.user.schoolId, studentId });
    return null;
  },
});

export const remove = userMutation({
  args: { studentId: v.id("students") },
  handler: async (ctx, { studentId }) => {
    await canManage(ctx, studentId);
    const existing = await ctx.db
      .query("faces")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .unique();
    if (existing) await ctx.db.delete(existing._id);
    return null;
  },
});

/** Vectores de los estudiantes de un viaje, solo para el conductor que lo opera. */
export const forTrip = driverQuery({
  args: { tripId: v.id("trips") },
  handler: async (ctx, { tripId }) => {
    const trip = await owned(ctx, tripId, ctx.user.schoolId);
    if (trip.driverId !== ctx.user._id || trip.status !== "in_progress") return [];
    const ids = trip.stops.flatMap((s) => s.studentIds);
    const faces = await Promise.all(
      ids.map((studentId) =>
        ctx.db.query("faces").withIndex("by_student", (q) => q.eq("studentId", studentId)).unique(),
      ),
    );
    return faces
      .filter((f): f is Doc<"faces"> => !!f)
      .map((f) => ({ studentId: f.studentId, descriptors: f.descriptors }));
  },
});
