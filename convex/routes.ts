// Rutas: la plantilla del recorrido (coordinador).
import { v } from "convex/values";
import { isTime } from "../lib/dates";
import { adminMutation, adminQuery, clean, fail, owned } from "./lib";
import { direction, stop } from "./schema";

export const list = adminQuery({
  args: {},
  handler: async (ctx) => {
    const routes = await ctx.db
      .query("routes")
      .withIndex("by_school", (q) => q.eq("schoolId", ctx.school._id))
      .collect();
    return Promise.all(
      routes
        .sort((a, b) => a.startTime.localeCompare(b.startTime) || a.name.localeCompare(b.name, "es"))
        .map(async (r) => {
          const vehicle = r.vehicleId ? await ctx.db.get(r.vehicleId) : null;
          const driver = r.driverId ? await ctx.db.get(r.driverId) : null;
          return {
            ...r,
            vehicle: vehicle && { name: vehicle.name, plate: vehicle.plate, capacity: vehicle.capacity },
            driverName: driver?.name ?? null,
            students: r.stops.reduce((n, s) => n + s.studentIds.length, 0),
          };
        }),
    );
  },
});

export const save = adminMutation({
  args: {
    id: v.optional(v.id("routes")),
    name: v.string(),
    direction,
    days: v.array(v.number()),
    startTime: v.string(),
    vehicleId: v.optional(v.id("vehicles")),
    driverId: v.optional(v.id("users")),
    stops: v.array(stop),
    active: v.boolean(),
  },
  handler: async (ctx, { id, ...args }) => {
    const schoolId = ctx.school._id;
    const name = clean(args.name, 60);
    if (name.length < 2) fail("Ponle un nombre a la ruta.");
    if (!isTime(args.startTime)) fail("La hora de inicio no es válida.");
    const days = [...new Set(args.days)].sort();
    if (!days.length || days.some((d) => !Number.isInteger(d) || d < 0 || d > 6)) {
      fail("Elige al menos un día de la semana.");
    }
    if (args.vehicleId && !(await owned(ctx, args.vehicleId, schoolId)).active) fail("Ese bus no está activo.");
    if (args.driverId) {
      const driver = await owned(ctx, args.driverId, schoolId);
      if (driver.role !== "driver" || !driver.active) fail("Ese conductor no está activo.");
    }
    if (args.stops.length > 60) fail("Una ruta admite máximo 60 paradas.");

    const seen = new Set<string>();
    const stopIds = new Set<string>();
    for (const s of args.stops) {
      if (!s.id || stopIds.has(s.id)) fail("Hay paradas duplicadas.");
      stopIds.add(s.id);
      if (!isTime(s.time)) fail(`La hora de la parada "${s.name}" no es válida.`);
      if (!s.studentIds.length) fail(`La parada "${s.name}" no tiene estudiantes.`);
      for (const studentId of s.studentIds) {
        if (seen.has(studentId)) fail("Un estudiante aparece en dos paradas.");
        seen.add(studentId);
        const student = await owned(ctx, studentId, schoolId);
        if (!student.active) fail(`${student.name} ya no está activo.`);
      }
    }
    // Un estudiante viaja en una sola ruta por sentido.
    const others = await ctx.db.query("routes").withIndex("by_school", (q) => q.eq("schoolId", schoolId)).collect();
    for (const other of others) {
      if (other._id === id || other.direction !== args.direction) continue;
      const clash = other.stops.flatMap((s) => s.studentIds).find((sid) => seen.has(sid));
      if (clash) {
        const student = await ctx.db.get(clash);
        fail(`${student?.name ?? "Un estudiante"} ya está en la ruta "${other.name}".`);
      }
    }
    const fields = {
      ...args,
      name,
      days,
      stops: args.stops.map((s) => ({ ...s, name: clean(s.name, 80) || "Parada" })),
    };
    if (!id) return ctx.db.insert("routes", { ...fields, schoolId });
    await owned(ctx, id, schoolId);
    await ctx.db.patch(id, fields);
    return id;
  },
});

/** Elimina la ruta. Los viajes ya hechos conservan su copia de paradas. */
export const remove = adminMutation({
  args: { id: v.id("routes") },
  handler: async (ctx, { id }) => {
    await owned(ctx, id, ctx.school._id);
    await ctx.db.delete(id);
    return null;
  },
});
