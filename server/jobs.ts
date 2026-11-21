// Cola de tareas sobre Postgres. Las tareas se insertan en la misma transacción que las
// origina (si la operación falla, la tarea no existe) y se toman con FOR UPDATE SKIP LOCKED,
// así varias réplicas de la app pueden trabajar sin repetir ninguna.
import { sql } from "drizzle-orm";
import { type Db, getDb, scoped } from "@/db/client";
import * as t from "@/db/schema";
import { type Tools, toolsFor } from "./core";
import { sendEmail } from "./email";

type Handler = (tools: Tools, payload: never) => Promise<void>;
const MAX_ATTEMPTS = 5;
const LOCK_MS = 60_000;

async function handlers(): Promise<Record<string, Handler>> {
  const [trips, notifications, billing] = await Promise.all([import("./trips"), import("./notifications"), import("./billing")]);
  return {
    announce: trips.announce as Handler,
    push: ((tools, payload) => notifications.sendPush(tools.db, payload)) as Handler,
    email: ((_tools, p: { to: string; subject: string; text: string }) => sendEmail(p.to, p.subject, p.text)) as Handler,
    lateStarts: trips.lateStarts as Handler,
    cleanup: trips.cleanup as Handler,
    billing: billing.dailyBilling as Handler,
  };
}

type Row = { id: string; kind: string; payload: Record<string, unknown>; attempts: number };

/** Ejecuta las tareas vencidas. Devuelve cuántas corrió. */
export async function runDueJobs(now = Date.now(), db: Db = getDb()): Promise<number> {
  const table = await handlers();
  const taken = await scoped("system", async (tx) => {
    const result = await tx.execute(sql`
      update jobs set locked_until = ${now + LOCK_MS}, attempts = attempts + 1
      where id in (
        select id from jobs
        where run_at <= ${now} and (locked_until is null or locked_until < ${now}) and attempts < ${MAX_ATTEMPTS}
        order by run_at limit 20 for update skip locked
      )
      returning id, kind, payload, attempts`);
    return (Array.isArray(result) ? result : (result as { rows: unknown[] }).rows) as Row[];
  }, db);

  for (const job of taken) {
    try {
      await scoped("system", async (tx) => {
        const handler = table[job.kind];
        if (!handler) throw new Error(`Tarea desconocida: ${job.kind}`);
        const { tools, flush } = toolsFor(tx, now);
        await handler(tools, job.payload as never);
        await flush();
        await tx.execute(sql`delete from jobs where id = ${job.id}`);
      }, db);
    } catch (error) {
      const message = (error as Error).message.slice(0, 500);
      console.error(`Tarea ${job.kind} falló (intento ${job.attempts}): ${message}`);
      // Reintento con espera creciente: 30 s, 2 min, 8 min…
      const retryAt = now + 30_000 * 4 ** (job.attempts - 1);
      await scoped("system", (tx) =>
        tx.execute(sql`update jobs set run_at = ${retryAt}, locked_until = null, last_error = ${message} where id = ${job.id}`), db);
    }
  }
  return taken.length;
}

/** Encola una tarea periódica si no hay ya una pendiente del mismo tipo. */
async function schedule(kind: string, db: Db) {
  await scoped("system", async (tx) => {
    const pending = await tx.execute(sql`select 1 from jobs where kind = ${kind} and attempts < ${MAX_ATTEMPTS} limit 1`);
    const rows = Array.isArray(pending) ? pending : (pending as { rows: unknown[] }).rows;
    if (!rows.length) await tx.insert(t.jobs).values({ kind, payload: {}, runAt: Date.now() });
  }, db);
}

/** Arranca el trabajador dentro del proceso de la app. Se llama una vez al iniciar el servidor. */
export function startWorker() {
  const state = globalThis as { __abordoWorker?: boolean };
  if (state.__abordoWorker) return;
  state.__abordoWorker = true;
  const db = getDb();
  const safely = (fn: () => Promise<unknown>) => fn().catch((e) => console.error("Trabajador:", (e as Error).message));
  setInterval(() => safely(() => runDueJobs()), 1000).unref();
  setInterval(() => safely(() => schedule("lateStarts", db)), 5 * 60_000).unref();
  setInterval(() => safely(() => Promise.all([schedule("cleanup", db), schedule("billing", db)])), 6 * 3600_000).unref();
  void safely(() => Promise.all([schedule("cleanup", db), schedule("billing", db)]));
}
