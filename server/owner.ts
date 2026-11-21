// Consola del dueño de la plataforma: colegios, estado de pago y pagos manuales.
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import * as t from "@/db/schema";
import { clean, fail, noArgs, ownerMutation, ownerQuery, uuid } from "./core";
import { applyPayment, coveredUntil, quote } from "./billing";
import { randomToken } from "./crypto";
import { billableStudents } from "./students";

export const schools = ownerQuery(noArgs, async (ctx) => {
  ctx.watch("platform");
  const [list, subs, admins] = await Promise.all([
    ctx.db.select().from(t.schools).orderBy(desc(t.schools.createdAt)),
    ctx.db.select().from(t.subscriptions),
    ctx.db.select({ schoolId: t.users.schoolId, email: t.users.email, name: t.users.name }).from(t.users).where(eq(t.users.role, "admin")),
  ]);
  return Promise.all(
    list.map(async (school) => {
      const sub = subs.find((s) => s.schoolId === school.id);
      const students = await billableStudents(ctx, school.id);
      return {
        id: school.id,
        name: school.name,
        createdAt: school.createdAt,
        admins: admins.filter((a) => a.schoolId === school.id).map((a) => `${a.name} <${a.email}>`),
        students,
        status: sub?.status ?? "trial",
        pricePerStudent: sub?.pricePerStudent ?? 0,
        coveredUntil: sub ? coveredUntil(sub) : 0,
        monthly: quote(students, sub?.pricePerStudent ?? 0, 1).total,
      };
    }),
  );
});

/** Ajusta precio, prueba o estado de un colegio. */
export const update = ownerMutation(
  z.object({
    schoolId: uuid,
    pricePerStudent: z.number().int().min(0).max(1_000_000).optional(),
    trialEndsAt: z.number().int().optional(),
    status: z.enum(["trial", "active", "past_due", "suspended", "cancelled"]).optional(),
  }),
  async (ctx, { schoolId, ...changes }) => {
    const updated = await ctx.db.update(t.subscriptions).set({ ...changes, remindedFor: null }).where(eq(t.subscriptions.schoolId, schoolId)).returning({ id: t.subscriptions.schoolId });
    if (!updated.length) fail("No encontrado.");
    await ctx.db.insert(t.auditLog).values({ schoolId, userId: ctx.user.id, action: "plataforma.suscripcion", detail: changes, ip: ctx.ip, at: ctx.now });
    ctx.emit(schoolId, "billing");
    ctx.emit("platform", "platform");
    return null;
  },
);

/** Registra un pago recibido por fuera (transferencia) y extiende la suscripción. */
export const recordPayment = ownerMutation(
  z.object({ schoolId: uuid, months: z.number().int().min(1).max(24), total: z.number().int().min(0), note: z.string().max(200) }),
  async (ctx, { schoolId, months, total, note }) => {
    const [sub] = await ctx.db.select().from(t.subscriptions).where(eq(t.subscriptions.schoolId, schoolId));
    if (!sub) fail("No encontrado.");
    const students = await billableStudents(ctx, schoolId);
    const [charge] = await ctx.db
      .insert(t.charges)
      .values({
        schoolId, reference: `manual-${schoolId.slice(0, 8)}-${ctx.now}-${randomToken().slice(0, 6)}`, students, months,
        subtotal: total, tax: 0, total, status: "pending", note: clean(note, 200),
      })
      .returning({ id: t.charges.id });
    await applyPayment(ctx, charge.id, "manual");
    ctx.emit("platform", "platform");
    return null;
  },
);
