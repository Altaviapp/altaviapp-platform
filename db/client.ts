// Conexión a PostgreSQL. Una sola por proceso; las pruebas inyectan una base en memoria.
import { sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "./schema";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

type Holder = { db?: Db; client?: postgres.Sql };
const holder = ((globalThis as { __abordoDb?: Holder }).__abordoDb ??= {});

function url(): string {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error("Falta DATABASE_URL");
  return value;
}

export function getDb(): Db {
  if (!holder.db) {
    holder.client = postgres(url(), { max: Number(process.env.DATABASE_POOL ?? 10), onnotice: () => {} });
    holder.db = drizzle(holder.client, { schema }) as unknown as Db;
  }
  return holder.db;
}

/** Solo para pruebas: usa esta base en lugar de conectarse. */
export function setDb(db: Db) {
  holder.db = db;
}

/** Cliente crudo, para LISTEN/NOTIFY. */
export function rawClient(): postgres.Sql {
  getDb();
  return holder.client!;
}

/** Aplica las migraciones pendientes. Un candado evita que dos réplicas migren a la vez. */
export async function runMigrations() {
  const client = postgres(url(), { max: 1, onnotice: () => {} });
  try {
    await client`select pg_advisory_lock(741100)`;
    await migrate(drizzle(client), { migrationsFolder: "db/migrations" });
  } finally {
    await client`select pg_advisory_unlock(741100)`.catch(() => {});
    await client.end();
  }
}

/**
 * Ejecuta `fn` en una transacción con el alcance de seguridad por fila fijado.
 * `scope` es el id del colegio o "system" para tareas internas.
 */
export function scoped<T>(scope: string, fn: (tx: Db) => Promise<T>, db: Db = getDb()): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.scope', ${scope}, true)`);
    return fn(tx as unknown as Db);
  });
}

export const setScope = (tx: Db, scope: string) => tx.execute(sql`select set_config('app.scope', ${scope}, true)`);
