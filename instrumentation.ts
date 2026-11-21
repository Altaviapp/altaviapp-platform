// Arranque del servidor: aplica migraciones pendientes e inicia el trabajador de tareas.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.DATABASE_URL) return;
  if (process.env.NODE_ENV === "production" && !process.env.FACE_KEY) throw new Error("Falta FACE_KEY");
  const { runMigrations } = await import("@/db/client");
  if (process.env.MIGRATE_ON_START !== "0") await runMigrations();
  const { startWorker } = await import("@/server/jobs");
  startWorker();
}
