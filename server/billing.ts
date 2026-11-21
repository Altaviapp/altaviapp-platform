// Suscripción por colegio: precio por estudiante activo al mes, cobrado con Wompi.
// El webhook de Wompi es la única fuente de verdad de un pago.
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/db/client";
import * as t from "@/db/schema";
import { type Tools, adminBillingMutation, adminQuery, clean, fail, noArgs } from "./core";
import { randomToken } from "./crypto";
import { appUrl } from "./email";
import { adminsOf, notify } from "./shared";
import { billableStudents } from "./students";
import { type WompiEvent, checkoutUrl, fetchTransaction, verifyEvent, wompiReady } from "./wompi";

const DAY = 86400000;
export const GRACE_DAYS = 7;
const taxPercent = () => Number(process.env.IVA_PERCENT ?? 19);

type Subscription = typeof t.subscriptions.$inferSelect;

/** Hasta cuándo está cubierto el colegio: fin del periodo pagado o, si no ha pagado, fin de la prueba. */
export const coveredUntil = (sub: Subscription) => Math.max(sub.paidUntil ?? 0, sub.trialEndsAt);

export function quote(students: number, pricePerStudent: number, months: number) {
  const subtotal = students * pricePerStudent * months;
  const tax = Math.round((subtotal * taxPercent()) / 100);
  return { students, months, subtotal, tax, total: subtotal + tax, taxPercent: taxPercent() };
}

export function addMonths(at: number, months: number): number {
  const d = new Date(at);
  const day = d.getUTCDate();
  d.setUTCMonth(d.getUTCMonth() + months, 1);
  // 31 de enero + 1 mes = último día de febrero.
  d.setUTCDate(Math.min(day, new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()));
  return d.getTime();
}

export const status = adminQuery(noArgs, async (ctx) => {
  ctx.watch("billing", "routes", "students");
  const [sub] = await ctx.db.select().from(t.subscriptions).where(eq(t.subscriptions.schoolId, ctx.school.id));
  if (!sub) fail("Este colegio no tiene suscripción.");
  const students = await billableStudents(ctx, ctx.school.id);
  const charges = await ctx.db.select().from(t.charges).where(eq(t.charges.schoolId, ctx.school.id)).orderBy(desc(t.charges.createdAt)).limit(24);
  return {
    status: sub.status,
    pricePerStudent: sub.pricePerStudent,
    trialEndsAt: sub.trialEndsAt,
    paidUntil: sub.paidUntil ?? undefined,
    coveredUntil: coveredUntil(sub),
    legalName: sub.legalName ?? "",
    taxId: sub.taxId ?? "",
    billingEmail: sub.billingEmail ?? "",
    monthly: quote(students, sub.pricePerStudent, 1),
    yearly: quote(students, sub.pricePerStudent, 12),
    canPay: wompiReady() && sub.pricePerStudent > 0 && students > 0,
    gatewayReady: wompiReady(),
    charges: charges.map((c) => ({
      id: c.id, reference: c.reference, students: c.students, months: c.months, total: c.total,
      status: c.status, method: c.method ?? undefined, createdAt: c.createdAt, paidAt: c.paidAt ?? undefined,
    })),
  };
});

export const saveInfo = adminBillingMutation(
  z.object({ legalName: z.string().max(160), taxId: z.string().max(40), billingEmail: z.string().max(200) }),
  async (ctx, args) => {
    await ctx.db
      .update(t.subscriptions)
      .set({ legalName: clean(args.legalName, 120), taxId: clean(args.taxId, 30), billingEmail: clean(args.billingEmail, 120).toLowerCase() })
      .where(eq(t.subscriptions.schoolId, ctx.school.id));
    ctx.touch("billing");
    return null;
  },
);

/** Crea el cobro del periodo y devuelve la URL del checkout de Wompi. */
export const checkout = adminBillingMutation(z.object({ months: z.union([z.literal(1), z.literal(12)]) }), async (ctx, { months }) => {
  if (!wompiReady()) fail("Los pagos en línea aún no están configurados. Escríbenos para pagar por transferencia.");
  const [sub] = await ctx.db.select().from(t.subscriptions).where(eq(t.subscriptions.schoolId, ctx.school.id));
  const q = quote(await billableStudents(ctx, ctx.school.id), sub.pricePerStudent, months);
  if (q.total <= 0) fail("Aún no hay estudiantes en rutas activas: no hay nada que cobrar.");
  const reference = `abordo-${ctx.school.id.slice(0, 8)}-${ctx.now}-${randomToken().slice(0, 6)}`;
  await ctx.db.insert(t.charges).values({
    schoolId: ctx.school.id, reference, students: q.students, months, subtotal: q.subtotal, tax: q.tax, total: q.total, status: "pending",
  });
  await ctx.audit("pago.iniciar", { reference, total: q.total, months });
  ctx.touch("billing");
  return {
    url: checkoutUrl({ reference, total: q.total, email: sub.billingEmail || ctx.user.email, redirectUrl: `${appUrl()}/admin/plan` }),
  };
});

/** Marca el cobro como pagado y extiende la suscripción. Idempotente. */
export async function applyPayment(tools: Tools, chargeId: string, method: string, wompiId?: string) {
  const [charge] = await tools.db.select().from(t.charges).where(eq(t.charges.id, chargeId));
  if (!charge || charge.status === "paid") return;
  const [sub] = await tools.db.select().from(t.subscriptions).where(eq(t.subscriptions.schoolId, charge.schoolId));
  // Pagar antes de vencer no pierde días: el nuevo periodo empieza donde termina el actual.
  const from = Math.max(tools.now, coveredUntil(sub));
  const paidUntil = addMonths(from, charge.months);
  await tools.db.update(t.charges).set({ status: "paid", paidAt: tools.now, method, wompiId }).where(eq(t.charges.id, charge.id));
  await tools.db.update(t.subscriptions).set({ status: "active", paidUntil, remindedFor: null }).where(eq(t.subscriptions.schoolId, charge.schoolId));
  await tools.db.insert(t.auditLog).values({ schoolId: charge.schoolId, action: "pago.aprobado", detail: { reference: charge.reference, total: charge.total, method }, at: tools.now });
  await notify(tools, charge.schoolId, await adminsOf(tools.db, charge.schoolId), "Pago recibido", `Tu suscripción queda activa hasta el ${new Date(paidUntil).toLocaleDateString("es-CO", { dateStyle: "long", timeZone: "America/Bogota" })}.`);
  tools.emit(charge.schoolId, "billing");
}

/**
 * Procesa un evento de Wompi ya validado en firma. Devuelve un texto corto para el log.
 * Nunca confía en el monto que diga otro lado que no sea Wompi: lo compara con el cobro guardado.
 */
export async function handleWompiEvent(tools: Tools, event: WompiEvent): Promise<string> {
  if (!verifyEvent(event)) return "firma inválida";
  const tx = event.data.transaction;
  if (event.event !== "transaction.updated" || !tx) return "evento ignorado";
  const [charge] = await tools.db.select().from(t.charges).where(eq(t.charges.reference, String(tx.reference)));
  if (!charge) return "referencia desconocida";
  if (charge.status === "paid") return "ya aplicado";
  if (tx.status === "APPROVED") {
    if (tx.currency !== "COP" || Number(tx.amount_in_cents) !== charge.total * 100) {
      await tools.db.insert(t.auditLog).values({ schoolId: charge.schoolId, action: "pago.monto_distinto", detail: { reference: charge.reference, recibido: tx.amount_in_cents }, at: tools.now });
      return "monto distinto";
    }
    // Segunda confirmación directa con Wompi, si hay llave privada.
    const confirmed = await fetchTransaction(tx.id).catch(() => null);
    if (confirmed && (confirmed.status !== "APPROVED" || confirmed.reference !== charge.reference || confirmed.amount_in_cents !== charge.total * 100)) {
      return "no confirmado por Wompi";
    }
    await applyPayment(tools, charge.id, tx.payment_method_type ?? "WOMPI", tx.id);
    return "pago aplicado";
  }
  if (tx.status === "DECLINED" || tx.status === "ERROR" || tx.status === "VOIDED") {
    await tools.db.update(t.charges).set({ status: "failed", wompiId: tx.id, method: tx.payment_method_type }).where(and(eq(t.charges.id, charge.id), eq(t.charges.status, "pending")));
    tools.emit(charge.schoolId, "billing");
    return "pago rechazado";
  }
  return "pendiente";
}

async function remind(tools: Tools, sub: Subscription, key: string, title: string, body: string) {
  if (sub.remindedFor === key) return;
  await tools.db.update(t.subscriptions).set({ remindedFor: key }).where(eq(t.subscriptions.schoolId, sub.schoolId));
  await notify(tools, sub.schoolId, await adminsOf(tools.db, sub.schoolId), title, body);
  if (sub.billingEmail) await tools.enqueue("email", { to: sub.billingEmail, subject: `Abordo: ${title}`, text: `${body}\n\nPaga en ${appUrl()}/admin/plan` });
}

/**
 * Revisión diaria: recordatorios, mora y suspensión. Suspender nunca corta un viaje en curso
 * ni el seguimiento de las familias: solo bloquea la edición del coordinador.
 */
export async function dailyBilling(tools: Tools) {
  const subs = await tools.db.select().from(t.subscriptions);
  for (const sub of subs) {
    if (sub.status === "cancelled" || sub.pricePerStudent <= 0) continue; // sin precio: colegio sin cobro
    const due = coveredUntil(sub);
    const dueText = new Date(due).toLocaleDateString("es-CO", { dateStyle: "long", timeZone: "America/Bogota" });
    const daysLeft = Math.ceil((due - tools.now) / DAY);
    let next = sub.status;
    if (daysLeft > 0) {
      if (daysLeft <= 7) await remind(tools, sub, `${due}:7`, "Tu periodo vence pronto", `La suscripción de Abordo vence el ${dueText}.`);
    } else if (-daysLeft < GRACE_DAYS) {
      next = "past_due";
      await remind(tools, sub, `${due}:0`, "Pago pendiente", `La suscripción venció el ${dueText}. Tienes ${GRACE_DAYS} días para pagar antes de que se bloquee la edición.`);
    } else {
      next = "suspended";
      await remind(tools, sub, `${due}:s`, "Suscripción suspendida", "La edición quedó bloqueada por falta de pago. Los viajes y el seguimiento a las familias siguen funcionando.");
    }
    if (next !== sub.status) {
      await tools.db.update(t.subscriptions).set({ status: next }).where(eq(t.subscriptions.schoolId, sub.schoolId));
      tools.emit(sub.schoolId, "billing");
    }
  }
}

export async function findCharge(db: Db, reference: string) {
  return (await db.select().from(t.charges).where(eq(t.charges.reference, reference)))[0];
}
