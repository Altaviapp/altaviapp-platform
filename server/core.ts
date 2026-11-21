// Núcleo del servidor: cada función pública se define aquí con su rol y sus argumentos.
// La identidad se resuelve SIEMPRE desde la cookie de sesión, nunca desde un argumento,
// y toda función corre en una transacción con el alcance del colegio (seguridad por fila).
import { and, eq, gt, sql } from "drizzle-orm";
import { z } from "zod";
import { type Db, getDb, setScope } from "@/db/client";
import * as t from "@/db/schema";
import type { Role } from "@/db/schema";
import { sha256 } from "./crypto";

export class AppError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

/** Error con mensaje para el usuario (en español). */
export function fail(message: string, status = 400): never {
  throw new AppError(message, status);
}

export type User = typeof t.users.$inferSelect;
export type School = typeof t.schools.$inferSelect;

/** Lo mínimo para trabajar con la base desde una función o una tarea. */
export type Tools = {
  db: Db;
  now: number;
  /** Avisa a los clientes conectados de ese colegio que cambiaron los datos con esas etiquetas. */
  emit: (schoolId: string, ...tags: string[]) => void;
  /** Encola una tarea en la misma transacción. */
  enqueue: (kind: string, payload: Record<string, unknown>, delayMs?: number) => Promise<void>;
};

type RequestCtx = Tools & {
  ip: string;
  /** Hash del token de la sesión actual, si la hay. */
  sessionHash: string | undefined;
  /** Etiquetas de las que depende esta consulta: si cambian, el cliente la repite. */
  watch: (...tags: string[]) => void;
  afterCommit: (fn: () => Promise<void> | void) => void;
  setSession: (token: string | null) => void;
  /** Confirma lo escrito hasta ahora y responde con error (p. ej. contar un intento fallido). */
  reject: (message: string) => void;
  audit: (action: string, detail?: Record<string, unknown>) => Promise<void>;
};

export type PublicCtx = RequestCtx & { user: User | null; school: School | null };
export type AuthCtx = RequestCtx & {
  user: User;
  school: School;
  /** Marca etiquetas cambiadas en el colegio de la sesión. */
  touch: (...tags: string[]) => void;
};
export type OwnerCtx = RequestCtx & { user: User };

type Kind = "query" | "mutation";
export type Fn<A = unknown, R = unknown> = {
  kind: Kind;
  roles: Role[] | "public";
  args: z.ZodType;
  handler: (ctx: never, args: never) => Promise<unknown>;
  /** Permitida aunque la suscripción esté suspendida (pagos, cierre de sesión). */
  whenSuspended?: boolean;
  __args?: A;
  __result?: R;
};

function define<C>(kind: Kind, roles: Role[] | "public", whenSuspended = false) {
  return <S extends z.ZodType, R>(args: S, handler: (ctx: C, args: z.output<S>) => Promise<R>): Fn<z.input<S>, R> => ({
    kind, roles, args, handler: handler as Fn["handler"], whenSuspended,
  });
}

export const publicQuery = define<PublicCtx>("query", "public");
export const publicMutation = define<PublicCtx>("mutation", "public");
export const adminQuery = define<AuthCtx>("query", ["admin"]);
export const adminMutation = define<AuthCtx>("mutation", ["admin"]);
/** Mutación del coordinador que sigue disponible con la suscripción suspendida. */
export const adminBillingMutation = define<AuthCtx>("mutation", ["admin"], true);
export const driverQuery = define<AuthCtx>("query", ["driver"]);
export const driverMutation = define<AuthCtx>("mutation", ["driver"]);
export const parentQuery = define<AuthCtx>("query", ["parent"]);
export const userQuery = define<AuthCtx>("query", ["admin", "driver", "parent"]);
export const userMutation = define<AuthCtx>("mutation", ["admin", "driver", "parent"]);
export const ownerQuery = define<OwnerCtx>("query", ["owner"]);
export const ownerMutation = define<OwnerCtx>("mutation", ["owner"]);

export const uuid = z.uuid();
export const noArgs = z.object({});

/** Herramientas de base (emitir, encolar) sobre una transacción. Devuelve también `flush`. */
export function toolsFor(db: Db, now = Date.now()) {
  const emitted = new Map<string, Set<string>>();
  const tools: Tools = {
    db,
    now,
    emit: (schoolId, ...tags) => {
      const set = emitted.get(schoolId) ?? new Set();
      tags.forEach((tag) => set.add(tag));
      emitted.set(schoolId, set);
    },
    enqueue: async (kind, payload, delayMs = 0) => {
      await db.insert(t.jobs).values({ kind, payload, runAt: now + delayMs });
    },
  };
  /** Publica los cambios; Postgres los entrega al confirmar la transacción. */
  const flush = async () => {
    for (const [schoolId, tags] of emitted) {
      const payload = JSON.stringify({ s: schoolId, t: [...tags] });
      await db.execute(sql`select pg_notify('abordo', ${payload})`);
    }
  };
  return { tools, flush };
}

export const SESSION_COOKIE = "abordo_session";

export async function sessionUser(db: Db, token: string | undefined, now: number): Promise<User | null> {
  if (!token) return null;
  const [row] = await db
    .select({ user: t.users })
    .from(t.sessions)
    .innerJoin(t.users, eq(t.users.id, t.sessions.userId))
    .where(and(eq(t.sessions.tokenHash, sha256(token)), gt(t.sessions.expiresAt, now)))
    .limit(1);
  return row?.user.active ? row.user : null;
}

export type RunResult = { data: unknown; tags: string[]; session?: string | null };

/**
 * Ejecuta una función con los datos de la petición. Todo ocurre en una transacción:
 * primero en alcance "system" para leer la sesión, luego acotada al colegio del usuario.
 */
export async function run(
  fn: Fn,
  rawArgs: unknown,
  request: { token?: string; ip: string; now?: number },
  db: Db = getDb(),
): Promise<RunResult> {
  const now = request.now ?? Date.now();
  const after: (() => Promise<void> | void)[] = [];
  const watched = new Set<string>();
  let session: string | null | undefined;
  let rejected: string | undefined;

  const data = await db.transaction(async (trx) => {
    const tx = trx as unknown as Db;
    await setScope(tx, "system");
    const user = await sessionUser(tx, request.token, now);
    if (fn.roles !== "public") {
      if (!user) fail("Tu sesión venció. Vuelve a ingresar.", 401);
      if (!fn.roles.includes(user.role)) fail("No tienes permiso para esto.", 403);
    }
    const school = user?.schoolId
      ? ((await tx.select().from(t.schools).where(eq(t.schools.id, user.schoolId)).limit(1))[0] ?? null)
      : null;

    if (fn.kind === "mutation" && user?.role === "admin" && school && !fn.whenSuspended) {
      const [sub] = await tx.select({ status: t.subscriptions.status }).from(t.subscriptions).where(eq(t.subscriptions.schoolId, school.id));
      if (sub?.status === "suspended" || sub?.status === "cancelled") {
        fail("La suscripción del colegio está suspendida. Regulariza el pago en «Plan y pagos» para volver a editar.", 402);
      }
    }
    // A partir de aquí la base solo deja ver filas de este colegio.
    if (school && fn.roles !== "public") await setScope(tx, school.id);

    const parsed = fn.args.safeParse(rawArgs ?? {});
    if (!parsed.success) fail("Los datos enviados no son válidos.");

    const { tools, flush } = toolsFor(tx, now);
    const ctx = {
      ...tools,
      ip: request.ip,
      sessionHash: request.token ? sha256(request.token) : undefined,
      user,
      school,
      watch: (...tags: string[]) => tags.forEach((tag) => watched.add(tag)),
      touch: (...tags: string[]) => school && tools.emit(school.id, ...tags),
      afterCommit: (f: () => Promise<void> | void) => void after.push(f),
      setSession: (token: string | null) => void (session = token),
      reject: (message: string) => void (rejected = message),
      audit: async (action: string, detail?: Record<string, unknown>) => {
        await tx.insert(t.auditLog).values({ schoolId: school?.id, userId: user?.id, action, detail, ip: request.ip, at: now });
      },
    };
    const result = await (fn.handler as (c: unknown, a: unknown) => Promise<unknown>)(ctx, parsed.data);
    await flush();
    return result;
  });

  if (rejected) fail(rejected);
  for (const f of after) {
    try {
      await f();
    } catch (error) {
      console.error("Fallo posterior a la transacción:", (error as Error).message);
    }
  }
  return { data: data ?? null, tags: [...watched], session };
}

/** Lee una fila por id y exige que sea del colegio de la sesión. */
export async function owned<K extends "students" | "vehicles" | "routes" | "trips" | "users" | "absences">(
  ctx: { db: Db; school: School },
  table: K,
  rowId: string,
): Promise<(typeof t)[K]["$inferSelect"]> {
  const tbl = t[table] as typeof t.students;
  const [row] = await ctx.db.select().from(tbl).where(and(eq(tbl.id, rowId), eq(tbl.schoolId, ctx.school.id))).limit(1);
  if (!row) fail("No encontrado.");
  return row as never;
}

export const clean = (text: string, max = 200) => text.trim().replace(/\s+/g, " ").slice(0, max);
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** Cuenta un intento y dice si sigue dentro del límite. */
export async function withinLimit(db: Db, key: string, max: number, windowMs: number, now: number): Promise<boolean> {
  const rows = await db.execute(sql`
    insert into rate_limits (key, count, reset_at) values (${key}, 1, ${now + windowMs})
    on conflict (key) do update set
      count = case when rate_limits.reset_at < ${now} then 1 else rate_limits.count + 1 end,
      reset_at = case when rate_limits.reset_at < ${now} then ${now + windowMs} else rate_limits.reset_at end
    returning count`);
  const list = (Array.isArray(rows) ? rows : (rows as { rows: unknown[] }).rows) as { count: number }[];
  return Number(list[0].count) <= max;
}
