// Reconocimiento facial. Al servidor solo llegan vectores numéricos calculados en el
// dispositivo; nunca fotos. Se guardan cifrados, exigen consentimiento y el acudiente puede retirarlo.
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import * as t from "@/db/schema";
import { DESCRIPTOR_SIZE } from "@/lib/face";
import { type AuthCtx, driverQuery, fail, owned, userMutation, uuid } from "./core";
import { seal, unseal } from "./crypto";
import { isGuardian } from "./shared";

async function canManage(ctx: AuthCtx, studentId: string) {
  await owned(ctx, "students", studentId);
  if (ctx.user.role === "admin") return "school" as const;
  if (ctx.user.role === "parent" && (await isGuardian(ctx.db, ctx.user.id, studentId))) return "guardian" as const;
  return fail("No tienes permiso para esto.", 403);
}

const descriptor = z.array(z.number()).length(DESCRIPTOR_SIZE);

export const enroll = userMutation(
  // Quien registra declara contar con la autorización del acudiente.
  z.object({ studentId: uuid, descriptors: z.array(descriptor).min(1).max(5), consent: z.literal(true) }),
  async (ctx, { studentId, descriptors }) => {
    const consentSource = await canManage(ctx, studentId);
    const row = { cipher: seal(descriptors), consentBy: ctx.user.id, consentAt: ctx.now, consentSource };
    await ctx.db
      .insert(t.faces)
      .values({ ...row, studentId, schoolId: ctx.school.id })
      .onConflictDoUpdate({ target: t.faces.studentId, set: row });
    await ctx.audit("rostro.registrar", { studentId, consentSource });
    ctx.touch("faces");
    return null;
  },
);

export const remove = userMutation(z.object({ studentId: uuid }), async (ctx, { studentId }) => {
  await canManage(ctx, studentId);
  await ctx.db.delete(t.faces).where(eq(t.faces.studentId, studentId));
  await ctx.audit("rostro.borrar", { studentId });
  ctx.touch("faces");
  return null;
});

/** Vectores de los estudiantes de un viaje, solo para el conductor que lo opera. */
export const forTrip = driverQuery(z.object({ tripId: uuid }), async (ctx, { tripId }) => {
  ctx.watch("faces", "trips");
  const trip = await owned(ctx, "trips", tripId);
  if (trip.driverId !== ctx.user.id || trip.status !== "in_progress") return [];
  const ids = trip.stops.flatMap((s) => s.studentIds);
  if (!ids.length) return [];
  const rows = await ctx.db.select().from(t.faces).where(inArray(t.faces.studentId, ids));
  return rows.map((f) => ({ studentId: f.studentId, descriptors: unseal<number[][]>(f.cipher) }));
});
