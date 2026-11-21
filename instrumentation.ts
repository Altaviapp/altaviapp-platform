// Arranque del servidor: aplica migraciones pendientes e inicia el trabajador de tareas.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.DATABASE_URL) return;
  if (process.env.NODE_ENV === "production" && !process.env.FACE_KEY) throw new Error("Falta FACE_KEY");
  const { runMigrations } = await import("@/db/client");
  if (process.env.MIGRATE_ON_START !== "0") await runMigrations();
  await ensureOwner();
  const { startWorker } = await import("@/server/jobs");
  startWorker();
}

/** Crea al dueño de la plataforma (consola /plataforma) si OWNER_EMAIL está definido. */
async function ensureOwner() {
  const email = process.env.OWNER_EMAIL?.trim().toLowerCase();
  if (!email) return;
  const { scoped } = await import("@/db/client");
  const { users } = await import("@/db/schema");
  await scoped("system", (tx) => tx.insert(users).values({ email, name: "Plataforma", role: "owner" }).onConflictDoNothing({ target: users.email }));
}
