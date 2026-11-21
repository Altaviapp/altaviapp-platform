// Estudiantes y sus acudientes (coordinador).
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import * as t from "@/db/schema";
import { EMAIL_RE } from "@/lib/csv";
import { type AuthCtx, adminMutation, adminQuery, clean, fail, noArgs, normalizeEmail, owned, uuid } from "./core";
import { welcomeText } from "./email";

const guardianInput = z.object({ name: z.string().max(120), email: z.string().max(200), phone: z.string().max(40).optional() });
const point = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });
const studentInput = z.object({
  name: z.string().max(120),
  grade: z.string().max(40),
  address: z.string().max(200),
  home: point.optional(),
  note: z.string().max(240).optional(),
  guardians: z.array(guardianInput).max(2),
});
type StudentInput = z.infer<typeof studentInput>;

export const list = adminQuery(noArgs, async (ctx) => {
  ctx.watch("students", "routes", "faces");
  const schoolId = ctx.school.id;
  const [students, links, parents, routes, faces] = await Promise.all([
    ctx.db.select().from(t.students).where(and(eq(t.students.schoolId, schoolId), eq(t.students.active, true))),
    ctx.db.select().from(t.guardians).where(eq(t.guardians.schoolId, schoolId)),
    ctx.db.select().from(t.users).where(and(eq(t.users.schoolId, schoolId), eq(t.users.role, "parent"))),
    ctx.db.select().from(t.routes).where(eq(t.routes.schoolId, schoolId)),
    ctx.db.select({ studentId: t.faces.studentId }).from(t.faces).where(eq(t.faces.schoolId, schoolId)),
  ]);
  const parentById = new Map(parents.map((p) => [p.id, p]));
  const withFace = new Set(faces.map((f) => f.studentId));
  return students
    .sort((a, b) => a.name.localeCompare(b.name, "es"))
    .map((s) => ({
      id: s.id,
      name: s.name,
      grade: s.grade,
      address: s.address,
      home: s.home ?? undefined,
      note: s.note ?? undefined,
      hasFace: withFace.has(s.id),
      guardians: links
        .filter((l) => l.studentId === s.id)
        .map((l) => parentById.get(l.userId))
        .filter((p) => !!p)
        .map((p) => ({ id: p.id, name: p.name, email: p.email, phone: p.phone ?? undefined })),
      routes: routes
        .filter((r) => r.stops.some((stop) => stop.studentIds.includes(s.id)))
        .map((r) => ({ id: r.id, name: r.name, direction: r.direction })),
    }));
});

/** Crea o reutiliza el usuario de cada acudiente y deja sus vínculos iguales a la lista. */
async function setGuardians(ctx: AuthCtx, studentId: string, guardians: StudentInput["guardians"]) {
  if (guardians.length < 1) fail("Cada estudiante lleva 1 o 2 acudientes.");
  const schoolId = ctx.school.id;
  const wanted: string[] = [];
  for (const g of guardians) {
    const email = normalizeEmail(g.email);
    if (!EMAIL_RE.test(email)) fail(`Correo inválido: ${g.email}`);
    const name = clean(g.name, 80) || email;
    const phone = g.phone ? clean(g.phone, 30) : undefined;
    // Con seguridad por fila, un correo de otro colegio no es visible: el índice único lo detecta al insertar.
    const [existing] = await ctx.db.select().from(t.users).where(eq(t.users.email, email)).limit(1);
    if (existing) {
      if (existing.role !== "parent") fail(`El correo ${email} ya se usa en otra cuenta que no es de acudiente.`);
      await ctx.db.update(t.users).set({ name, phone: phone ?? existing.phone, active: true }).where(eq(t.users.id, existing.id));
      wanted.push(existing.id);
    } else {
      const inserted = await ctx.db
        .insert(t.users)
        .values({ schoolId, email, name, phone, role: "parent" })
        .onConflictDoNothing({ target: t.users.email })
        .returning({ id: t.users.id });
      if (!inserted.length) fail(`El correo ${email} ya se usa en otra cuenta que no es de acudiente.`);
      await ctx.enqueue("email", { to: email, subject: `${ctx.school.name} te agregó a Abordo`, text: welcomeText(name, ctx.school.name, "parent") });
      wanted.push(inserted[0].id);
    }
  }
  if (new Set(wanted).size !== wanted.length) fail("Los dos acudientes tienen el mismo correo.");
  const current = await ctx.db.select().from(t.guardians).where(eq(t.guardians.studentId, studentId));
  for (const link of current) {
    if (wanted.includes(link.userId)) continue;
    await ctx.db.delete(t.guardians).where(and(eq(t.guardians.studentId, studentId), eq(t.guardians.userId, link.userId)));
    await dropOrphanParent(ctx, link.userId);
  }
  const missing = wanted.filter((userId) => !current.some((l) => l.userId === userId));
  if (missing.length) await ctx.db.insert(t.guardians).values(missing.map((userId) => ({ schoolId, studentId, userId })));
}

/** Un acudiente sin hijos a cargo ya no tiene por qué tener cuenta (sus sesiones caen en cascada). */
async function dropOrphanParent(ctx: AuthCtx, userId: string) {
  const left = await ctx.db.select({ s: t.guardians.studentId }).from(t.guardians).where(eq(t.guardians.userId, userId)).limit(1);
  if (!left.length) await ctx.db.delete(t.users).where(and(eq(t.users.id, userId), eq(t.users.role, "parent")));
}

async function upsert(ctx: AuthCtx, id: string | undefined, input: StudentInput) {
  const name = clean(input.name, 80);
  const grade = clean(input.grade, 30);
  if (name.length < 2) fail("Escribe el nombre del estudiante.");
  if (!grade) fail("Elige el grado.");
  const fields = {
    name,
    grade,
    address: clean(input.address, 160),
    home: input.home ?? null,
    note: input.note ? clean(input.note, 200) : null,
  };
  let studentId = id;
  if (studentId) {
    await owned(ctx, "students", studentId);
    await ctx.db.update(t.students).set(fields).where(eq(t.students.id, studentId));
  } else {
    [{ id: studentId }] = await ctx.db.insert(t.students).values({ ...fields, schoolId: ctx.school.id }).returning({ id: t.students.id });
  }
  await setGuardians(ctx, studentId, input.guardians);
  ctx.touch("students");
  return studentId;
}

export const save = adminMutation(studentInput.extend({ id: uuid.optional() }), async (ctx, { id, ...input }) => upsert(ctx, id, input));

/** Importación masiva. Omite a quien ya existe con el mismo nombre y grado. */
export const importRows = adminMutation(z.object({ rows: z.array(studentInput).max(200) }), async (ctx, { rows }) => {
  const students = await ctx.db
    .select({ name: t.students.name, grade: t.students.grade })
    .from(t.students)
    .where(and(eq(t.students.schoolId, ctx.school.id), eq(t.students.active, true)));
  const key = (name: string, grade: string) => `${name.toLowerCase()}|${grade.toLowerCase()}`;
  const known = new Set(students.map((s) => key(s.name, s.grade)));
  let created = 0;
  let skipped = 0;
  for (const row of rows) {
    const k = key(clean(row.name, 80), clean(row.grade, 30));
    if (known.has(k)) {
      skipped++;
      continue;
    }
    await upsert(ctx, undefined, row);
    known.add(k);
    created++;
  }
  await ctx.audit("estudiantes.importar", { created, skipped });
  return { created, skipped };
});

/** Archiva al estudiante: sale de sus rutas y se borran sus vínculos y su rostro. */
export const archive = adminMutation(z.object({ id: uuid }), async (ctx, { id }) => {
  await owned(ctx, "students", id);
  await ctx.db.update(t.students).set({ active: false }).where(eq(t.students.id, id));
  const routes = await ctx.db.select().from(t.routes).where(eq(t.routes.schoolId, ctx.school.id));
  for (const route of routes) {
    if (!route.stops.some((s) => s.studentIds.includes(id))) continue;
    const stops = route.stops
      .map((s) => ({ ...s, studentIds: s.studentIds.filter((x) => x !== id) }))
      .filter((s) => s.studentIds.length > 0);
    await ctx.db.update(t.routes).set({ stops }).where(eq(t.routes.id, route.id));
  }
  const links = await ctx.db.select().from(t.guardians).where(eq(t.guardians.studentId, id));
  await ctx.db.delete(t.guardians).where(eq(t.guardians.studentId, id));
  for (const link of links) await dropOrphanParent(ctx, link.userId);
  await ctx.db.delete(t.faces).where(eq(t.faces.studentId, id));
  ctx.touch("students", "routes", "faces");
  return null;
});

/** Estudiantes activos asignados a alguna ruta activa: la base del cobro. */
export async function billableStudents(ctx: { db: AuthCtx["db"] }, schoolId: string): Promise<number> {
  const routes = await ctx.db.select({ stops: t.routes.stops }).from(t.routes).where(and(eq(t.routes.schoolId, schoolId), eq(t.routes.active, true)));
  const ids = [...new Set(routes.flatMap((r) => r.stops.flatMap((s) => s.studentIds)))];
  if (!ids.length) return 0;
  const rows = await ctx.db.select({ id: t.students.id }).from(t.students).where(and(inArray(t.students.id, ids), eq(t.students.active, true)));
  return rows.length;
}
