// Rutas: la plantilla del recorrido (coordinador).
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import * as t from "@/db/schema";
import { isTime } from "@/lib/dates";
import { estimateTimes, orderStops } from "@/lib/geo";
import { adminMutation, adminQuery, clean, fail, noArgs, owned, uuid } from "./core";
import { planRoute, routingEnabled } from "./routing";

const direction = z.enum(["to_school", "from_school"]);
const stop = z.object({
  id: z.string().min(1).max(40),
  name: z.string().max(120),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  time: z.string(),
  studentIds: z.array(uuid).min(1).max(60),
});

export const list = adminQuery(noArgs, async (ctx) => {
  ctx.watch("routes", "team");
  const schoolId = ctx.school.id;
  const [routes, vehicles, drivers] = await Promise.all([
    ctx.db.select().from(t.routes).where(eq(t.routes.schoolId, schoolId)),
    ctx.db.select().from(t.vehicles).where(eq(t.vehicles.schoolId, schoolId)),
    ctx.db.select({ id: t.users.id, name: t.users.name }).from(t.users).where(and(eq(t.users.schoolId, schoolId), eq(t.users.role, "driver"))),
  ]);
  const vehicle = new Map(vehicles.map((v) => [v.id, v]));
  const driver = new Map(drivers.map((d) => [d.id, d.name]));
  return routes
    .sort((a, b) => a.startTime.localeCompare(b.startTime) || a.name.localeCompare(b.name, "es"))
    .map((r) => {
      const v = r.vehicleId ? vehicle.get(r.vehicleId) : undefined;
      return {
        id: r.id, name: r.name, direction: r.direction, days: r.days, startTime: r.startTime,
        vehicleId: r.vehicleId ?? undefined, driverId: r.driverId ?? undefined, stops: r.stops,
        path: r.path ?? undefined, active: r.active,
        vehicle: v ? { name: v.name, plate: v.plate, capacity: v.capacity } : null,
        driverName: (r.driverId && driver.get(r.driverId)) ?? null,
        students: r.stops.reduce((n, s) => n + s.studentIds.length, 0),
      };
    });
});

/**
 * Ordena las paradas y calcula sus horas y el trazo. Usa el motor de rutas por calles
 * si está disponible; si no, vecino más cercano en línea recta.
 */
export const plan = adminMutation(
  z.object({
    direction,
    startTime: z.string(),
    reorder: z.boolean(),
    stops: z.array(z.object({ id: z.string(), lat: z.number(), lng: z.number() })).max(60),
  }),
  async (ctx, args) => {
    if (!isTime(args.startTime)) fail("La hora de inicio no es válida.");
    const school = ctx.school.location;
    if (!school) fail("Primero ubica el colegio en Ajustes.");
    const byStreet = await planRoute(args.stops, school, args.direction, args.startTime, args.reorder);
    if (byStreet) {
      return { order: byStreet.order.map((i) => args.stops[i].id), times: byStreet.times, path: byStreet.path as string | null, byStreet: true };
    }
    const ordered = args.reorder ? orderStops(args.stops, school, args.direction) : args.stops;
    return {
      order: ordered.map((s) => s.id),
      times: estimateTimes(ordered, args.startTime, school, args.direction),
      path: null as string | null,
      byStreet: false,
    };
  },
);

export const save = adminMutation(
  z.object({
    id: uuid.optional(),
    name: z.string().max(120),
    direction,
    days: z.array(z.number().int().min(0).max(6)).min(1).max(7),
    startTime: z.string(),
    vehicleId: uuid.optional(),
    driverId: uuid.optional(),
    stops: z.array(stop).max(60),
    active: z.boolean(),
  }),
  async (ctx, { id, ...args }) => {
    const schoolId = ctx.school.id;
    const name = clean(args.name, 60);
    if (name.length < 2) fail("Ponle un nombre a la ruta.");
    if (!isTime(args.startTime)) fail("La hora de inicio no es válida.");
    const days = [...new Set(args.days)].sort();
    if (args.vehicleId && !(await owned(ctx, "vehicles", args.vehicleId)).active) fail("Ese bus no está activo.");
    if (args.driverId) {
      const driver = await owned(ctx, "users", args.driverId);
      if (driver.role !== "driver" || !driver.active) fail("Ese conductor no está activo.");
    }
    const seen = new Set<string>();
    const stopIds = new Set<string>();
    for (const s of args.stops) {
      if (stopIds.has(s.id)) fail("Hay paradas duplicadas.");
      stopIds.add(s.id);
      if (!isTime(s.time)) fail(`La hora de la parada "${s.name}" no es válida.`);
      for (const studentId of s.studentIds) {
        if (seen.has(studentId)) fail("Un estudiante aparece en dos paradas.");
        seen.add(studentId);
      }
    }
    if (seen.size) {
      const found = await ctx.db
        .select({ id: t.students.id, name: t.students.name, active: t.students.active })
        .from(t.students)
        .where(and(eq(t.students.schoolId, schoolId), inArray(t.students.id, [...seen])));
      if (found.length !== seen.size) fail("No encontrado.");
      const inactive = found.find((s) => !s.active);
      if (inactive) fail(`${inactive.name} ya no está activo.`);
      // Un estudiante viaja en una sola ruta por sentido.
      const others = await ctx.db.select().from(t.routes).where(and(eq(t.routes.schoolId, schoolId), eq(t.routes.direction, args.direction)));
      for (const other of others) {
        if (other.id === id) continue;
        const clash = other.stops.flatMap((s) => s.studentIds).find((sid) => seen.has(sid));
        if (clash) fail(`${found.find((s) => s.id === clash)?.name ?? "Un estudiante"} ya está en la ruta "${other.name}".`);
      }
    }
    const stops = args.stops.map((s) => ({ ...s, name: clean(s.name, 80) || "Parada" }));
    // El trazo por calles se recalcula aquí para que siempre corresponda al orden guardado.
    const school = ctx.school.location;
    const street = school && routingEnabled() ? await planRoute(stops, school, args.direction, args.startTime, false) : null;
    const fields = {
      name, direction: args.direction, days, startTime: args.startTime, active: args.active, stops,
      vehicleId: args.vehicleId ?? null, driverId: args.driverId ?? null, path: street?.path ?? null,
    };
    ctx.touch("routes");
    if (!id) {
      const [row] = await ctx.db.insert(t.routes).values({ ...fields, schoolId }).returning({ id: t.routes.id });
      return row.id;
    }
    await owned(ctx, "routes", id);
    await ctx.db.update(t.routes).set(fields).where(eq(t.routes.id, id));
    return id;
  },
);

/** Elimina la ruta. Los viajes ya hechos conservan su copia de paradas. */
export const remove = adminMutation(z.object({ id: uuid }), async (ctx, { id }) => {
  await owned(ctx, "routes", id);
  await ctx.db.delete(t.routes).where(eq(t.routes.id, id));
  ctx.touch("routes");
  return null;
});
