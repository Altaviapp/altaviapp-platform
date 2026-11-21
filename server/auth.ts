// Acceso sin contraseña: código de 6 dígitos al correo y sesión en cookie.
import { eq } from "drizzle-orm";
import { z } from "zod";
import * as t from "@/db/schema";
import { EMAIL_RE } from "@/lib/csv";
import { type PublicCtx, clean, fail, noArgs, normalizeEmail, publicMutation, publicQuery, withinLimit } from "./core";
import { randomDigits, randomToken, sha256 } from "./crypto";
import { sendEmail } from "./email";

const CODE_TTL = 10 * 60 * 1000;
export const SESSION_TTL = 90 * 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_WAIT = 60 * 1000;
const HOUR = 60 * 60 * 1000;
const MAX_PER_HOUR = 5;
export const TRIAL_DAYS = 30;

export const DEFAULT_GRADES = [
  "Transición", "1.º", "2.º", "3.º", "4.º", "5.º", "6.º", "7.º", "8.º", "9.º", "10.º", "11.º",
];

/** Genera un código para el correo si está registrado y lo envía al confirmar la transacción. */
async function issueCode(ctx: PublicCtx, email: string) {
  const [user] = await ctx.db.select().from(t.users).where(eq(t.users.email, email)).limit(1);
  if (!user || !user.active) return;
  const prev = user.login;
  if (prev && ctx.now - prev.sentAt < RESEND_WAIT) return;
  const sameWindow = !!prev && ctx.now - prev.windowStart < HOUR;
  if (sameWindow && prev.sentCount >= MAX_PER_HOUR) return;
  const code = randomDigits();
  await ctx.db
    .update(t.users)
    .set({
      login: {
        codeHash: sha256(`${email}:${code}`),
        expiresAt: ctx.now + CODE_TTL,
        attempts: 0,
        sentAt: ctx.now,
        sentCount: sameWindow ? prev.sentCount + 1 : 1,
        windowStart: sameWindow ? prev.windowStart : ctx.now,
      },
    })
    .where(eq(t.users.id, user.id));
  // El código en claro nunca se guarda: se envía después de confirmar.
  ctx.afterCommit(() =>
    sendEmail(
      email,
      `${code} es tu código de Abordo`,
      `Tu código de acceso es ${code}. Vence en 10 minutos. Si no lo pediste, ignora este correo.`,
    ),
  );
}

const emailArg = z.string().max(200);

/** Envía un código si el correo está registrado. La respuesta no revela si lo está. */
export const requestCode = publicMutation(z.object({ email: emailArg }), async (ctx, args) => {
  const email = normalizeEmail(args.email);
  if (!EMAIL_RE.test(email)) fail("Escribe un correo válido.");
  if (!(await withinLimit(ctx.db, `code:${ctx.ip}`, 20, HOUR, ctx.now))) {
    fail("Demasiados intentos desde esta conexión. Espera un momento.", 429);
  }
  await issueCode(ctx, email);
  return null;
});

export const verifyCode = publicMutation(z.object({ email: emailArg, code: z.string().max(12) }), async (ctx, args) => {
  const email = normalizeEmail(args.email);
  const wrong = "Código incorrecto o vencido. Pide uno nuevo.";
  if (!(await withinLimit(ctx.db, `verify:${ctx.ip}`, 30, HOUR, ctx.now))) {
    return ctx.reject("Demasiados intentos desde esta conexión. Espera un momento.");
  }
  const [user] = await ctx.db.select().from(t.users).where(eq(t.users.email, email)).limit(1);
  const login = user?.login;
  if (!user || !user.active || !login || login.expiresAt < ctx.now || login.attempts >= MAX_ATTEMPTS) {
    return ctx.reject(wrong);
  }
  if (login.codeHash !== sha256(`${email}:${args.code.trim()}`)) {
    await ctx.db.update(t.users).set({ login: { ...login, attempts: login.attempts + 1 } }).where(eq(t.users.id, user.id));
    return ctx.reject(wrong);
  }
  const token = randomToken();
  await ctx.db.update(t.users).set({ login: null, verifiedAt: user.verifiedAt ?? ctx.now }).where(eq(t.users.id, user.id));
  await ctx.db.insert(t.sessions).values({ userId: user.id, tokenHash: sha256(token), expiresAt: ctx.now + SESSION_TTL });
  await ctx.db.insert(t.auditLog).values({ schoolId: user.schoolId, userId: user.id, action: "sesion.inicio", ip: ctx.ip, at: ctx.now });
  ctx.setSession(token);
  return { role: user.role };
});

/** Registro de un colegio nuevo con su primer coordinador y 30 días de prueba. */
export const registerSchool = publicMutation(
  z.object({ schoolName: z.string().max(120), name: z.string().max(120), email: emailArg, timezone: z.string().max(60) }),
  async (ctx, args) => {
    const email = normalizeEmail(args.email);
    if (!EMAIL_RE.test(email)) fail("Escribe un correo válido.");
    const schoolName = clean(args.schoolName, 80);
    const name = clean(args.name, 80);
    if (schoolName.length < 3 || name.length < 2) fail("Completa el nombre del colegio y el tuyo.");
    try {
      new Intl.DateTimeFormat("es", { timeZone: args.timezone });
    } catch {
      fail("Zona horaria inválida.");
    }
    if (!(await withinLimit(ctx.db, `register:${ctx.ip}`, 5, 24 * HOUR, ctx.now))) {
      fail("Demasiados registros desde esta conexión. Intenta mañana.", 429);
    }
    const [existing] = await ctx.db.select({ id: t.users.id }).from(t.users).where(eq(t.users.email, email)).limit(1);
    if (existing) fail("Ese correo ya está registrado. Ingresa con tu código.");
    const [school] = await ctx.db
      .insert(t.schools)
      .values({ name: schoolName, timezone: args.timezone, grades: DEFAULT_GRADES })
      .returning();
    await ctx.db.insert(t.users).values({ schoolId: school.id, email, name, role: "admin" });
    await ctx.db.insert(t.subscriptions).values({
      schoolId: school.id,
      status: "trial",
      pricePerStudent: Number(process.env.PRICE_PER_STUDENT_COP ?? 0),
      trialEndsAt: ctx.now + TRIAL_DAYS * 24 * HOUR,
      billingEmail: email,
    });
    await issueCode(ctx, email);
    return null;
  },
);

export const signOut = publicMutation(noArgs, async (ctx) => {
  // Solo la sesión de este dispositivo: la cookie identifica cuál.
  if (ctx.sessionHash) await ctx.db.delete(t.sessions).where(eq(t.sessions.tokenHash, ctx.sessionHash));
  ctx.setSession(null);
  return null;
});

/** Usuario y colegio de la sesión, o null si no hay sesión válida. */
export const me = publicQuery(noArgs, async (ctx) => {
  const { user, school } = ctx;
  if (!user) return null;
  ctx.watch("school", "billing");
  const [sub] = school
    ? await ctx.db.select().from(t.subscriptions).where(eq(t.subscriptions.schoolId, school.id)).limit(1)
    : [];
  return {
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    school: school && { id: school.id, name: school.name, timezone: school.timezone, location: school.location, grades: school.grades },
    subscription: sub && user.role === "admin" ? { status: sub.status, trialEndsAt: sub.trialEndsAt, paidUntil: sub.paidUntil } : null,
  };
});
