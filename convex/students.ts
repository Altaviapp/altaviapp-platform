// Estudiantes y sus acudientes (coordinador).
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";
import { EMAIL_RE } from "../lib/csv";
import { adminMutation, adminQuery, clean, fail, normalizeEmail, owned } from "./lib";
import { point } from "./schema";

const guardianInput = v.object({
  name: v.string(),
  email: v.string(),
  phone: v.optional(v.string()),
});

const studentInput = {
  name: v.string(),
  grade: v.string(),
  address: v.string(),
  home: v.optional(point),
  note: v.optional(v.string()),
  guardians: v.array(guardianInput),
};

export const list = adminQuery({
  args: {},
  handler: async (ctx) => {
    const schoolId = ctx.school._id;
    const [students, links, parents, routes, faces] = await Promise.all([
      ctx.db.query("students").withIndex("by_school", (q) => q.eq("schoolId", schoolId)).collect(),
      ctx.db.query("guardians").withIndex("by_school", (q) => q.eq("schoolId", schoolId)).collect(),
      ctx.db
        .query("users")
        .withIndex("by_school_role", (q) => q.eq("schoolId", schoolId).eq("role", "parent"))
        .collect(),
      ctx.db.query("routes").withIndex("by_school", (q) => q.eq("schoolId", schoolId)).collect(),
      ctx.db.query("faces").withIndex("by_school", (q) => q.eq("schoolId", schoolId)).collect(),
    ]);
    const parentById = new Map(parents.map((p) => [p._id, p]));
    const withFace = new Set(faces.map((f) => f.studentId));
    return students
      .filter((s) => s.active)
      .sort((a, b) => a.name.localeCompare(b.name, "es"))
      .map((s) => ({
        _id: s._id,
        name: s.name,
        grade: s.grade,
        address: s.address,
        home: s.home,
        note: s.note,
        hasFace: withFace.has(s._id),
        guardians: links
          .filter((l) => l.studentId === s._id)
          .map((l) => parentById.get(l.userId))
          .filter((p): p is Doc<"users"> => !!p)
          .map((p) => ({ _id: p._id, name: p.name, email: p.email, phone: p.phone })),
        routes: routes
          .filter((r) => r.stops.some((stop) => stop.studentIds.includes(s._id)))
          .map((r) => ({ _id: r._id, name: r.name, direction: r.direction })),
      }));
  },
});

type GuardianInput = { name: string; email: string; phone?: string };
type Ctx = MutationCtx & { school: Doc<"schools"> };

/** Crea o reutiliza el usuario de cada acudiente y deja sus vínculos iguales a la lista. */
async function setGuardians(ctx: Ctx, studentId: Id<"students">, guardians: GuardianInput[]) {
  if (guardians.length < 1 || guardians.length > 2) fail("Cada estudiante lleva 1 o 2 acudientes.");
  const schoolId = ctx.school._id;
  const wanted: Id<"users">[] = [];
  for (const g of guardians) {
    const email = normalizeEmail(g.email);
    if (!EMAIL_RE.test(email)) fail(`Correo inválido: ${g.email}`);
    const name = clean(g.name, 80) || email;
    const phone = g.phone ? clean(g.phone, 30) : undefined;
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) {
      if (existing.schoolId !== schoolId || existing.role !== "parent") {
        fail(`El correo ${email} ya se usa en otra cuenta que no es de acudiente.`);
      }
      await ctx.db.patch(existing._id, { name, phone: phone ?? existing.phone, active: true });
      wanted.push(existing._id);
    } else {
      const id = await ctx.db.insert("users", {
        schoolId, email, name, phone, role: "parent", active: true,
      });
      await ctx.scheduler.runAfter(0, internal.email.welcome, {
        to: email, name, school: ctx.school.name, role: "parent",
      });
      wanted.push(id);
    }
  }
  if (new Set(wanted).size !== wanted.length) fail("Los dos acudientes tienen el mismo correo.");
  const current = await ctx.db
    .query("guardians")
    .withIndex("by_student", (q) => q.eq("studentId", studentId))
    .collect();
  for (const link of current) {
    if (!wanted.includes(link.userId)) {
      await ctx.db.delete(link._id);
      await dropOrphanParent(ctx, link.userId);
    }
  }
  for (const userId of wanted) {
    if (!current.some((l) => l.userId === userId)) {
      await ctx.db.insert("guardians", { schoolId, studentId, userId });
    }
  }
}

/** Un acudiente sin hijos a cargo ya no tiene por qué tener cuenta. */
async function dropOrphanParent(ctx: MutationCtx, userId: Id<"users">) {
  const left = await ctx.db.query("guardians").withIndex("by_user", (q) => q.eq("userId", userId)).first();
  if (left) return;
  for (const table of ["sessions", "pushSubscriptions"] as const) {
    const rows = await ctx.db.query(table).withIndex("by_user", (q) => q.eq("userId", userId)).collect();
    for (const row of rows) await ctx.db.delete(row._id);
  }
  await ctx.db.delete(userId);
}

async function upsert(
  ctx: Ctx,
  id: Id<"students"> | undefined,
  input: {
    name: string; grade: string; address: string;
    home?: { lat: number; lng: number }; note?: string; guardians: GuardianInput[];
  },
) {
  const name = clean(input.name, 80);
  const grade = clean(input.grade, 30);
  if (name.length < 2) fail("Escribe el nombre del estudiante.");
  if (!grade) fail("Elige el grado.");
  if (input.home && !(Math.abs(input.home.lat) <= 90 && Math.abs(input.home.lng) <= 180)) {
    fail("La ubicación no es válida.");
  }
  const fields = {
    name,
    grade,
    address: clean(input.address, 160),
    home: input.home,
    note: input.note ? clean(input.note, 200) : undefined,
  };
  let studentId = id;
  if (studentId) {
    await owned(ctx, studentId, ctx.school._id);
    await ctx.db.patch(studentId, fields);
  } else {
    studentId = await ctx.db.insert("students", { ...fields, schoolId: ctx.school._id, active: true });
  }
  await setGuardians(ctx, studentId, input.guardians);
  return studentId;
}

export const save = adminMutation({
  args: { id: v.optional(v.id("students")), ...studentInput },
  handler: async (ctx, { id, ...input }) => upsert(ctx, id, input),
});

/** Importación masiva. Omite a quien ya existe con el mismo nombre, grado y acudiente. */
export const importRows = adminMutation({
  args: { rows: v.array(v.object(studentInput)) },
  handler: async (ctx, { rows }) => {
    if (rows.length > 200) fail("Importa máximo 200 filas por lote.");
    const schoolId = ctx.school._id;
    const students = await ctx.db
      .query("students")
      .withIndex("by_school", (q) => q.eq("schoolId", schoolId))
      .collect();
    const key = (name: string, grade: string) => `${name.toLowerCase()}|${grade.toLowerCase()}`;
    const known = new Set(students.filter((s) => s.active).map((s) => key(s.name, s.grade)));
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
    return { created, skipped };
  },
});

/** Archiva al estudiante: sale de sus rutas y se borran sus vínculos y su rostro. */
export const archive = adminMutation({
  args: { id: v.id("students") },
  handler: async (ctx, { id }) => {
    await owned(ctx, id, ctx.school._id);
    await ctx.db.patch(id, { active: false });
    const routes = await ctx.db
      .query("routes")
      .withIndex("by_school", (q) => q.eq("schoolId", ctx.school._id))
      .collect();
    for (const route of routes) {
      if (!route.stops.some((s) => s.studentIds.includes(id))) continue;
      const stops = route.stops
        .map((s) => ({ ...s, studentIds: s.studentIds.filter((x) => x !== id) }))
        .filter((s) => s.studentIds.length > 0);
      await ctx.db.patch(route._id, { stops });
    }
    const links = await ctx.db.query("guardians").withIndex("by_student", (q) => q.eq("studentId", id)).collect();
    for (const link of links) {
      await ctx.db.delete(link._id);
      await dropOrphanParent(ctx, link.userId);
    }
    const face = await ctx.db.query("faces").withIndex("by_student", (q) => q.eq("studentId", id)).unique();
    if (face) await ctx.db.delete(face._id);
    return null;
  },
});
