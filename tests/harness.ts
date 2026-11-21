// Base de datos real (PostgreSQL en memoria con PGlite) con las migraciones del proyecto,
// conectada con un rol que NO es superusuario para que la seguridad por fila aplique.
import { PGlite } from "@electric-sql/pglite";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { type Db, scoped, setDb } from "@/db/client";
import * as schema from "@/db/schema";
import { seedDemo } from "@/db/seed";
import { type Api, findFn } from "@/server/api";
import { AppError, type Fn } from "@/server/core";
import { sha256 } from "@/server/crypto";
import { runDueJobs } from "@/server/jobs";

type Args<F> = F extends Fn<infer A, unknown> ? A : never;
type Result<F> = F extends Fn<unknown, infer R> ? R : never;
type Name = { [M in keyof Api]: `${M & string}.${keyof Api[M] & string}` }[keyof Api];
type FnOf<N extends Name> = N extends `${infer M}.${infer F}` ? (M extends keyof Api ? (F extends keyof Api[M] ? Api[M][F] : never) : never) : never;

export const DATE = "2026-03-11"; // miércoles
export const SIX_AM = Date.UTC(2026, 2, 11, 11, 0); // 06:00 en Bogotá

export async function createApp() {
  const client = new PGlite();
  await client.exec(`
    create role abordo nosuperuser;
    grant all on schema public to abordo;
    do $$ begin execute format('grant create on database %I to abordo', current_database()); end $$;
    set role abordo;`);
  const db = drizzle(client, { schema }) as unknown as Db;
  await migrate(db as never, { migrationsFolder: "db/migrations" });
  setDb(db);

  const clock = { now: SIX_AM };
  const cookies = new Map<string, string>();

  /** Llama una función de la API como lo haría el cliente. `as` es el correo de quien llama. */
  async function call<N extends Name>(name: N, args: Args<FnOf<N>>, as?: string, ip = "10.0.0.1"): Promise<Result<FnOf<N>>> {
    const result = await (await import("@/server/core")).run(findFn(name)!, args, { token: as ? cookies.get(as) : undefined, ip, now: clock.now }, db);
    if (result.session && as) cookies.set(as, result.session);
    return result.data as Result<FnOf<N>>;
  }

  /** Abre sesión para un correo sin pasar por el código. */
  async function login(email: string) {
    await scoped("system", async (tx) => {
      const [user] = await tx.select().from(schema.users).where(eq(schema.users.email, email));
      await tx.insert(schema.sessions).values({ userId: user.id, tokenHash: sha256(`tok-${email}`), expiresAt: clock.now + 86400000 * 3650 });
    }, db);
    cookies.set(email, `tok-${email}`);
    return email;
  }

  return {
    db,
    clock,
    cookies,
    call,
    login,
    seed: () => scoped("system", (tx) => seedDemo(tx, clock.now), db),
    /** Corre las tareas vencidas hasta `ms` en el futuro (avisos diferidos, push, correo). */
    jobs: async (ms = 10_000) => {
      clock.now += ms;
      while (await runDueJobs(clock.now, db));
    },
    system: <T>(fn: (tx: Db) => Promise<T>) => scoped("system", fn, db),
    raw: (query: string) => client.query(query),
    sql,
  };
}

/** Mensaje de error de una llamada, o "sin error". */
export async function message(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (e) {
    return e instanceof AppError ? e.message : `ERROR INTERNO: ${(e as Error).message}`;
  }
  return "sin error";
}
