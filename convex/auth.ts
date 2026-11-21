// Acceso sin contraseña: código de 6 dígitos al correo y sesión por token.
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { ActionCtx, action, internalMutation, mutation, query } from "./_generated/server";
import { EMAIL_RE } from "../lib/csv";
import { sendEmail } from "./email";
import { clean, fail, normalizeEmail, sessionUser, sha256 } from "./lib";

const CODE_TTL = 10 * 60 * 1000;
const SESSION_TTL = 90 * 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_WAIT = 60 * 1000;
const HOUR = 60 * 60 * 1000;
const MAX_PER_HOUR = 5;

function randomDigits(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(n).padStart(6, "0");
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function issueAndSend(ctx: ActionCtx, email: string) {
  const code = randomDigits();
  const issued = await ctx.runMutation(internal.auth.issueCode, {
    email,
    codeHash: await sha256(`${email}:${code}`),
  });
  if (issued) {
    await sendEmail(
      email,
      `${code} es tu código de Abordo`,
      `Tu código de acceso es ${code}. Vence en 10 minutos. Si no lo pediste, ignora este correo.`,
    );
  }
}

/** Envía un código si el correo está registrado. La respuesta no revela si lo está. */
export const requestCode = action({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    if (!EMAIL_RE.test(email)) fail("Escribe un correo válido.");
    await issueAndSend(ctx, email);
    return null;
  },
});

export const issueCode = internalMutation({
  args: { email: v.string(), codeHash: v.string() },
  handler: async (ctx, { email, codeHash }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!user || !user.active) return false;
    const now = Date.now();
    const prev = user.login;
    if (prev && now - prev.sentAt < RESEND_WAIT) return false;
    const sameWindow = prev && now - prev.windowStart < HOUR;
    if (sameWindow && prev.sentCount >= MAX_PER_HOUR) return false;
    await ctx.db.patch(user._id, {
      login: {
        codeHash,
        expiresAt: now + CODE_TTL,
        attempts: 0,
        sentAt: now,
        sentCount: sameWindow ? prev.sentCount + 1 : 1,
        windowStart: sameWindow ? prev.windowStart : now,
      },
    });
    return true;
  },
});

export const verifyCode = action({
  args: { email: v.string(), code: v.string() },
  handler: async (ctx, args): Promise<{ token: string }> => {
    const email = normalizeEmail(args.email);
    const token = randomToken();
    const ok = await ctx.runMutation(internal.auth.consumeCode, {
      email,
      codeHash: await sha256(`${email}:${args.code.trim()}`),
      tokenHash: await sha256(token),
    });
    if (!ok) fail("Código incorrecto o vencido. Pide uno nuevo.");
    return { token };
  },
});

// Devuelve false en vez de lanzar error para que el conteo de intentos quede guardado.
export const consumeCode = internalMutation({
  args: { email: v.string(), codeHash: v.string(), tokenHash: v.string() },
  handler: async (ctx, { email, codeHash, tokenHash }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    const login = user?.login;
    const now = Date.now();
    if (!user || !user.active || !login || login.expiresAt < now) return false;
    if (login.attempts >= MAX_ATTEMPTS) return false;
    if (login.codeHash !== codeHash) {
      await ctx.db.patch(user._id, { login: { ...login, attempts: login.attempts + 1 } });
      return false;
    }
    await ctx.db.patch(user._id, { login: undefined, verifiedAt: user.verifiedAt ?? now });
    await ctx.db.insert("sessions", { userId: user._id, tokenHash, expiresAt: now + SESSION_TTL });
    return true;
  },
});

/** Registro de un colegio nuevo con su primer coordinador. */
export const registerSchool = action({
  args: { schoolName: v.string(), name: v.string(), email: v.string(), timezone: v.string() },
  handler: async (ctx, args) => {
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
    await ctx.runMutation(internal.auth.createSchool, {
      schoolName,
      name,
      email,
      timezone: args.timezone,
    });
    await issueAndSend(ctx, email);
    return null;
  },
});

export const DEFAULT_GRADES = [
  "Inicial", "1.º", "2.º", "3.º", "4.º", "5.º", "6.º", "7.º", "8.º", "9.º", "10.º", "11.º", "12.º",
];

export const createSchool = internalMutation({
  args: { schoolName: v.string(), name: v.string(), email: v.string(), timezone: v.string() },
  handler: async (ctx, { schoolName, name, email, timezone }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) fail("Ese correo ya está registrado. Ingresa con tu código.");
    const schoolId = await ctx.db.insert("schools", {
      name: schoolName,
      timezone,
      grades: DEFAULT_GRADES,
    });
    await ctx.db.insert("users", { schoolId, email, name, role: "admin", active: true });
  },
});

export const signOut = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const tokenHash = await sha256(token);
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("tokenHash", tokenHash))
      .unique();
    if (session) await ctx.db.delete(session._id);
    return null;
  },
});

/** Usuario y colegio de la sesión, o null si no hay sesión válida. */
export const me = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await sessionUser(ctx, token);
    if (!user) return null;
    const school = (await ctx.db.get(user.schoolId))!;
    return {
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
      school,
    };
  },
});
