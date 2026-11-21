// Utilidades de base de datos por línea de comandos:
//   pnpm db:migrate            aplica las migraciones pendientes
//   pnpm seed                  crea el colegio de demostración
//   pnpm make-owner correo nombre   crea (o asciende) al dueño de la plataforma
import { eq } from "drizzle-orm";
import { runMigrations, scoped } from "@/db/client";
import * as t from "@/db/schema";
import { seedDemo } from "@/db/seed";

const [command, ...rest] = process.argv.slice(2);

async function main() {
  if (command === "migrate") {
    await runMigrations();
    console.log("Migraciones aplicadas.");
  } else if (command === "seed") {
    await runMigrations();
    console.log(await scoped("system", (tx) => seedDemo(tx)));
  } else if (command === "owner") {
    const [email, ...name] = rest;
    if (!email) throw new Error("Uso: pnpm make-owner correo@dominio.com Nombre");
    await scoped("system", async (tx) => {
      const [existing] = await tx.select().from(t.users).where(eq(t.users.email, email.toLowerCase()));
      if (existing && existing.role !== "owner") throw new Error("Ese correo ya pertenece a un usuario de un colegio.");
      if (!existing) await tx.insert(t.users).values({ email: email.toLowerCase(), name: name.join(" ") || "Plataforma", role: "owner" });
    });
    console.log(`Dueño de la plataforma listo: ${email}. Entra en /plataforma con ese correo.`);
  } else {
    throw new Error("Comando desconocido. Usa: migrate, seed u owner.");
  }
}

main().then(() => process.exit(0), (error) => {
  console.error((error as Error).message);
  process.exit(1);
});
