// Identidad, permisos y avisos. Toda función pública pasa por aquí:
// el usuario se resuelve SIEMPRE desde el token de sesión, nunca desde un argumento.
import { customMutation, customQuery } from "convex-helpers/server/customFunctions";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";
import { absentSet, Direction } from "../lib/roster";

export type Role = Doc<"users">["role"];

export function fail(message: string): never {
  throw new ConvexError(message);
}

export async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function sessionUser(ctx: QueryCtx, token: string): Promise<Doc<"users"> | null> {
  if (!token) return null;
  const tokenHash = await sha256(token);
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("tokenHash", tokenHash))
    .unique();
  if (!session || session.expiresAt < Date.now()) return null;
  const user = await ctx.db.get(session.userId);
  return user?.active ? user : null;
}

function withRoles(roles: Role[]) {
  return {
    args: { token: v.string() },
    input: async (ctx: QueryCtx, { token }: { token: string }) => {
      const user = await sessionUser(ctx, token);
      if (!user) fail("Tu sesión venció. Vuelve a ingresar.");
      if (!roles.includes(user.role)) fail("No tienes permiso para esto.");
      const school = (await ctx.db.get(user.schoolId))!;
      return { ctx: { user, school }, args: {} };
    },
  };
}

const ALL: Role[] = ["admin", "driver", "parent"];
export const adminQuery = customQuery(query, withRoles(["admin"]));
export const adminMutation = customMutation(mutation, withRoles(["admin"]));
export const driverQuery = customQuery(query, withRoles(["driver"]));
export const driverMutation = customMutation(mutation, withRoles(["driver"]));
export const parentQuery = customQuery(query, withRoles(["parent"]));
export const userQuery = customQuery(query, withRoles(ALL));
export const userMutation = customMutation(mutation, withRoles(ALL));

type Scoped = "students" | "vehicles" | "routes" | "trips" | "users" | "absences";

/** Lee un documento y exige que sea del colegio de la sesión. */
export async function owned<T extends Scoped>(
  ctx: QueryCtx,
  id: Id<T>,
  schoolId: Id<"schools">,
): Promise<Doc<T>> {
  const doc = (await ctx.db.get(id)) as Doc<Scoped> | null;
  if (!doc || doc.schoolId !== schoolId) fail("No encontrado.");
  return doc as unknown as Doc<T>;
}

export async function guardiansOf(ctx: QueryCtx, studentIds: Id<"students">[]) {
  const ids = new Set<Id<"users">>();
  for (const studentId of new Set(studentIds)) {
    const rows = await ctx.db
      .query("guardians")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .collect();
    rows.forEach((r) => ids.add(r.userId));
  }
  return [...ids];
}

export async function isGuardian(ctx: QueryCtx, userId: Id<"users">, studentId: Id<"students">) {
  const rows = await ctx.db
    .query("guardians")
    .withIndex("by_student", (q) => q.eq("studentId", studentId))
    .collect();
  return rows.some((r) => r.userId === userId);
}

export async function adminsOf(ctx: QueryCtx, schoolId: Id<"schools">) {
  const rows = await ctx.db
    .query("users")
    .withIndex("by_school_role", (q) => q.eq("schoolId", schoolId).eq("role", "admin"))
    .collect();
  return rows.filter((u) => u.active).map((u) => u._id);
}

/** Estudiantes ausentes de un colegio para una fecha y sentido. */
export async function absentFor(
  ctx: QueryCtx,
  schoolId: Id<"schools">,
  date: string,
  direction: Direction,
): Promise<Set<string>> {
  const rows = await ctx.db
    .query("absences")
    .withIndex("by_school_to", (q) => q.eq("schoolId", schoolId).gte("to", date))
    .collect();
  return absentSet(rows, date, direction);
}

/** Guarda el aviso en la app de cada usuario y dispara el push. */
export async function notify(
  ctx: MutationCtx,
  userIds: Id<"users">[],
  title: string,
  body: string,
  tripId?: Id<"trips">,
) {
  const unique = [...new Set(userIds)];
  if (!unique.length) return;
  const at = Date.now();
  for (const userId of unique) {
    await ctx.db.insert("notifications", { userId, title, body, tripId, read: false, at });
  }
  await ctx.scheduler.runAfter(0, internal.push.send, { userIds: unique, title, body });
}

export function clean(text: string, max = 200): string {
  return text.trim().replace(/\s+/g, " ").slice(0, max);
}
