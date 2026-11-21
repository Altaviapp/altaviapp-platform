// Vista de la familia: estado de cada hijo hoy, ausencias y actividad.
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";
import { addDays, isDate, localNow } from "../lib/dates";
import { covers, eta, runsOn, studentStatus } from "../lib/roster";
import {
  absentFor, adminsOf, clean, fail, isGuardian, notify, owned, parentQuery, userMutation,
} from "./lib";
import { direction } from "./schema";

async function myChildren(ctx: QueryCtx, userId: Id<"users">) {
  const links = await ctx.db.query("guardians").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
  const children = await Promise.all(links.map((l) => ctx.db.get(l.studentId)));
  return children.filter((c): c is Doc<"students"> => !!c && c.active);
}

const weekdayOf = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay();

/** Cada hijo con sus trayectos de la fecha (mañana y tarde) y su estado. */
export const home = parentQuery({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    if (!isDate(date)) fail("Fecha inválida.");
    const schoolId = ctx.school._id;
    const children = await myChildren(ctx, ctx.user._id);
    const routes = await ctx.db.query("routes").withIndex("by_school", (q) => q.eq("schoolId", schoolId)).collect();
    const weekday = weekdayOf(date);

    const result = await Promise.all(
      children.map(async (child) => {
        const legs = await Promise.all(
          routes
            .filter((r) => runsOn(r, weekday) && r.stops.some((s) => s.studentIds.includes(child._id)))
            .map(async (route) => {
              const trip = await ctx.db
                .query("trips")
                .withIndex("by_route_date", (q) => q.eq("routeId", route._id).eq("date", date))
                .unique();
              // Con viaje iniciado manda su copia de paradas; si no, la ruta.
              const stops = trip?.stops ?? route.stops;
              const stopIndex = stops.findIndex((s) => s.studentIds.includes(child._id));
              const stop = stops[stopIndex];
              const absent = await absentFor(ctx, schoolId, date, route.direction);
              let status: ReturnType<typeof studentStatus> = absent.has(child._id) ? "absent" : "expected";
              if (trip) {
                const boardings = await ctx.db.query("boardings").withIndex("by_trip", (q) => q.eq("tripId", trip._id)).collect();
                status = studentStatus(child._id, new Map(boardings.map((b) => [b.studentId, b.status])), absent);
              }
              const driverId = trip?.driverId ?? route.driverId;
              const vehicleId = trip?.vehicleId ?? route.vehicleId;
              const [driver, vehicle] = await Promise.all([
                driverId ? ctx.db.get(driverId) : null,
                vehicleId ? ctx.db.get(vehicleId) : null,
              ]);
              return {
                routeName: route.name,
                direction: route.direction,
                startTime: route.startTime,
                stop: stop && { id: stop.id, name: stop.name, lat: stop.lat, lng: stop.lng, time: stop.time },
                eta: stop ? eta(stop.time, trip?.delayMin ?? 0) : null,
                status,
                trip: trip && {
                  _id: trip._id,
                  status: trip.status,
                  delayMin: trip.delayMin,
                  departed: trip.direction === "to_school" || !!trip.departedAt,
                  stopsAway: Math.max(0, stopIndex - trip.stopIndex),
                  notices: trip.notices.filter((n) => n.toFamilies),
                  // Nunca se envían las demás paradas: son los domicilios de otras familias.
                },
                driver: driver && { name: driver.name, phone: driver.phone },
                vehicle: vehicle && { name: vehicle.name, plate: vehicle.plate },
              };
            }),
        );
        const absences = await ctx.db
          .query("absences")
          .withIndex("by_student", (q) => q.eq("studentId", child._id).gte("to", date))
          .collect();
        const face = await ctx.db.query("faces").withIndex("by_student", (q) => q.eq("studentId", child._id)).unique();
        return {
          _id: child._id,
          name: child.name,
          grade: child.grade,
          hasFace: !!face,
          legs: legs.sort((a, b) => a.startTime.localeCompare(b.startTime)),
          absences: absences
            .sort((a, b) => a.from.localeCompare(b.from))
            .map((a) => ({ _id: a._id, from: a.from, to: a.to, direction: a.direction, note: a.note })),
        };
      }),
    );
    return { school: ctx.school.location ?? null, children: result.sort((a, b) => a.name.localeCompare(b.name, "es")) };
  },
});

/** Asistencia de los últimos 30 días de los hijos del acudiente. */
export const activity = parentQuery({
  args: {},
  handler: async (ctx) => {
    const children = await myChildren(ctx, ctx.user._id);
    const since = Date.now() - 30 * 86400000;
    const rows = [];
    for (const child of children) {
      const boardings = await ctx.db
        .query("boardings")
        .withIndex("by_student", (q) => q.eq("studentId", child._id).gte("at", since))
        .collect();
      for (const b of boardings) {
        const trip = await ctx.db.get(b.tripId);
        if (!trip) continue;
        rows.push({
          _id: b._id, studentName: child.name, status: b.status, at: b.at, boardedAt: b.boardedAt,
          date: trip.date, routeName: trip.routeName, direction: trip.direction,
        });
      }
    }
    return rows.sort((a, b) => b.at - a.at);
  },
});

/** Reporta una ausencia. Queda aplicada al instante; la crea un acudiente o el coordinador. */
export const reportAbsence = userMutation({
  args: {
    studentId: v.id("students"),
    from: v.string(),
    to: v.string(),
    direction: v.union(direction, v.literal("both")),
    note: v.optional(v.string()),
  },
  handler: async (ctx, { studentId, from, to, note, ...args }) => {
    const student = await owned(ctx, studentId, ctx.user.schoolId);
    const allowed =
      ctx.user.role === "admin" || (ctx.user.role === "parent" && (await isGuardian(ctx, ctx.user._id, studentId)));
    if (!allowed) fail("No tienes permiso para esto.");
    const today = localNow(ctx.school.timezone).date;
    if (!isDate(from) || !isDate(to) || from > to) fail("Revisa las fechas.");
    if (from < today) fail("La ausencia no puede empezar en una fecha pasada.");
    if (to > addDays(from, 60)) fail("Una ausencia cubre máximo 60 días.");
    const id = await ctx.db.insert("absences", {
      schoolId: student.schoolId, studentId, from, to, direction: args.direction,
      note: note ? clean(note, 200) : undefined, createdBy: ctx.user._id,
    });
    // Avisar al coordinador y a los conductores de las rutas afectadas.
    const routes = await ctx.db.query("routes").withIndex("by_school", (q) => q.eq("schoolId", student.schoolId)).collect();
    const drivers = routes
      .filter((r) => (args.direction === "both" || r.direction === args.direction) && r.stops.some((s) => s.studentIds.includes(studentId)))
      .map((r) => r.driverId)
      .filter((d): d is Id<"users"> => !!d);
    const recipients = [...(await adminsOf(ctx, student.schoolId)), ...drivers].filter((u) => u !== ctx.user._id);
    const when = from === to ? `el ${from}` : `del ${from} al ${to}`;
    const which = { both: "", to_school: " (mañana)", from_school: " (tarde)" }[args.direction];
    await notify(ctx, recipients, "Ausencia reportada", `${student.name} no viaja ${when}${which}.`);
    return id;
  },
});

/** Cancela una ausencia vigente, salvo que el viaje de hoy que la usa ya haya iniciado. */
export const cancelAbsence = userMutation({
  args: { id: v.id("absences") },
  handler: async (ctx, { id }) => {
    const absence = await owned(ctx, id, ctx.user.schoolId);
    const allowed =
      ctx.user.role === "admin" ||
      (ctx.user.role === "parent" && (await isGuardian(ctx, ctx.user._id, absence.studentId)));
    if (!allowed) fail("No tienes permiso para esto.");
    const today = localNow(ctx.school.timezone).date;
    if (absence.to < today) fail("Esa ausencia ya pasó.");
    if (absence.from <= today) {
      const trips = await ctx.db
        .query("trips")
        .withIndex("by_school_date", (q) => q.eq("schoolId", absence.schoolId).eq("date", today))
        .collect();
      const used = trips.some(
        (t) => covers(absence, today, t.direction) && t.stops.some((s) => s.studentIds.includes(absence.studentId)),
      );
      if (used) fail("El viaje de hoy ya inició. Llama al colegio si hubo un cambio.");
    }
    await ctx.db.delete(id);
    return null;
  },
});
