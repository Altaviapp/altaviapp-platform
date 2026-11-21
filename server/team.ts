// Equipo (coordinadores y conductores), buses y ajustes del colegio.
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import * as t from "@/db/schema";
import { EMAIL_RE } from "@/lib/csv";
import { adminMutation, adminQuery, clean, fail, noArgs, normalizeEmail, owned, uuid } from "./core";
import { welcomeText } from "./email";

export const list = adminQuery(noArgs, async (ctx) => {
  ctx.watch("team");
  const schoolId = ctx.school.id;
  const [members, vehicles] = await Promise.all([
    ctx.db.select().from(t.users).where(and(eq(t.users.schoolId, schoolId), ne(t.users.role, "parent"))),
    ctx.db.select().from(t.vehicles).where(eq(t.vehicles.schoolId, schoolId)),
  ]);
  return {
    members: members
      .sort((a, b) => a.name.localeCompare(b.name, "es"))
      .map((u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone ?? undefined, role: u.role, active: u.active, joined: !!u.verifiedAt })),
    vehicles: vehicles
      .sort((a, b) => a.name.localeCompare(b.name, "es", { numeric: true }))
      .map((v) => ({ id: v.id, name: v.name, plate: v.plate, capacity: v.capacity, active: v.active })),
  };
});

export const saveMember = adminMutation(
  z.object({
    id: uuid.optional(),
    name: z.string().max(120),
    email: z.string().max(200),
    phone: z.string().max(40).optional(),
    role: z.enum(["admin", "driver"]),
    active: z.boolean(),
  }),
  async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const name = clean(args.name, 80);
    if (name.length < 2) fail("Escribe el nombre.");
    if (!EMAIL_RE.test(email)) fail("Escribe un correo válido.");
    const fields = { name, email, phone: args.phone ? clean(args.phone, 30) : null, role: args.role, active: args.active };
    ctx.touch("team", "routes");
    if (!args.id) {
      const inserted = await ctx.db
        .insert(t.users)
        .values({ ...fields, schoolId: ctx.school.id })
        .onConflictDoNothing({ target: t.users.email })
        .returning({ id: t.users.id });
      if (!inserted.length) fail("Ese correo ya está registrado.");
      await ctx.enqueue("email", { to: email, subject: `${ctx.school.name} te agregó a Abordo`, text: welcomeText(name, ctx.school.name, args.role) });
      return inserted[0].id;
    }
    const member = await owned(ctx, "users", args.id);
    if (member.role === "parent") fail("Los acudientes se editan desde el estudiante.");
    if (member.id === ctx.user.id && (!args.active || args.role !== "admin")) {
      fail("No puedes quitarte tu propio acceso de coordinador.");
    }
    // El índice único de correo es global; un choque (aunque sea con otro colegio) se traduce aquí.
    try {
      await ctx.db.update(t.users).set(fields).where(eq(t.users.id, member.id));
    } catch (error) {
      if ((error as { code?: string }).code === "23505") fail("Ese correo ya está registrado.");
      throw error;
    }
    if (member.role === "driver" && (!args.active || args.role !== "driver")) {
      await ctx.db.update(t.routes).set({ driverId: null }).where(eq(t.routes.driverId, member.id));
    }
    if (!args.active || member.email !== email || member.role !== args.role) {
      await ctx.db.delete(t.sessions).where(eq(t.sessions.userId, member.id));
    }
    await ctx.audit("equipo.editar", { userId: member.id, role: args.role, active: args.active });
    return member.id;
  },
);

export const saveVehicle = adminMutation(
  z.object({ id: uuid.optional(), name: z.string().max(60), plate: z.string().max(20), capacity: z.number().int().min(1).max(100), active: z.boolean() }),
  async (ctx, args) => {
    const name = clean(args.name, 40);
    if (!name) fail("Ponle un nombre o número al bus.");
    const fields = { name, plate: clean(args.plate, 12).toUpperCase(), capacity: args.capacity, active: args.active };
    ctx.touch("team", "routes");
    if (!args.id) {
      const [row] = await ctx.db.insert(t.vehicles).values({ ...fields, schoolId: ctx.school.id }).returning({ id: t.vehicles.id });
      return row.id;
    }
    await owned(ctx, "vehicles", args.id);
    await ctx.db.update(t.vehicles).set(fields).where(eq(t.vehicles.id, args.id));
    if (!args.active) await ctx.db.update(t.routes).set({ vehicleId: null }).where(eq(t.routes.vehicleId, args.id));
    return args.id;
  },
);

export const saveSchool = adminMutation(
  z.object({
    name: z.string().max(120),
    timezone: z.string().max(60),
    location: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180), address: z.string().max(200) }).optional(),
    grades: z.array(z.string().max(40)).max(40),
  }),
  async (ctx, args) => {
    const name = clean(args.name, 80);
    if (name.length < 3) fail("Escribe el nombre del colegio.");
    try {
      new Intl.DateTimeFormat("es", { timeZone: args.timezone });
    } catch {
      fail("Zona horaria inválida.");
    }
    const grades = [...new Set(args.grades.map((g) => clean(g, 30)).filter(Boolean))];
    if (!grades.length) fail("Deja al menos un grado.");
    await ctx.db
      .update(t.schools)
      .set({ name, timezone: args.timezone, location: args.location ?? null, grades })
      .where(eq(t.schools.id, ctx.school.id));
    ctx.touch("school");
    return null;
  },
);
