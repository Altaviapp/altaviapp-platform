// Viajes: la ejecución de una ruta en una fecha (PRD §6).
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { MutationCtx, QueryCtx, internalMutation } from "./_generated/server";
import { isDate, localNow } from "../lib/dates";
import { distance } from "../lib/geo";
import {
  Boarding, delayAt, eta, nextStopIndex, runsOn, studentStatus, tally,
} from "../lib/roster";
import {
  absentFor, adminMutation, adminQuery, adminsOf, clean, driverMutation, driverQuery,
  fail, guardiansOf, notify, owned, userQuery,
} from "./lib";

const NEAR_METERS = 500;
const UNDO_WINDOW_MS = 8000; // el aviso a la familia espera por si el conductor deshace

type StatusMap = Map<string, Boarding["status"]>;

async function loadState(ctx: QueryCtx, trip: Doc<"trips">) {
  const boardings = await ctx.db
    .query("boardings")
    .withIndex("by_trip", (q) => q.eq("tripId", trip._id))
    .collect();
  const statuses: StatusMap = new Map(boardings.map((b) => [b.studentId, b.status]));
  const absent = await absentFor(ctx, trip.schoolId, trip.date, trip.direction);
  return { boardings, statuses, absent };
}

const weekdayOf = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay();

// ───────────────────────── Conductor ─────────────────────────

/** Rutas del conductor para una fecha, con su viaje si ya existe. */
export const myDay = driverQuery({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    if (!isDate(date)) fail("Fecha inválida.");
    const routes = await ctx.db
      .query("routes")
      .withIndex("by_driver", (q) => q.eq("driverId", ctx.user._id))
      .collect();
    const today = routes.filter((r) => runsOn(r, weekdayOf(date)));
    const result = await Promise.all(
      today.map(async (r) => {
        const trip = await ctx.db
          .query("trips")
          .withIndex("by_route_date", (q) => q.eq("routeId", r._id).eq("date", date))
          .unique();
        const absent = await absentFor(ctx, r.schoolId, date, r.direction);
        const ids = r.stops.flatMap((s) => s.studentIds);
        const vehicle = r.vehicleId ? await ctx.db.get(r.vehicleId) : null;
        return {
          routeId: r._id,
          name: r.name,
          direction: r.direction,
          startTime: r.startTime,
          stops: r.stops.length,
          expected: ids.filter((id) => !absent.has(id)).length,
          absent: ids.filter((id) => absent.has(id)).length,
          vehicle: vehicle && { name: vehicle.name, plate: vehicle.plate },
          trip: trip && { _id: trip._id, status: trip.status },
        };
      }),
    );
    return result.sort((a, b) => a.startTime.localeCompare(b.startTime));
  },
});

export const start = driverMutation({
  args: { routeId: v.id("routes") },
  handler: async (ctx, { routeId }) => {
    const route = await owned(ctx, routeId, ctx.user.schoolId);
    if (route.driverId !== ctx.user._id) fail("Esta ruta no está asignada a ti.");
    const now = localNow(ctx.school.timezone);
    if (!runsOn(route, now.weekday)) fail("Esta ruta no corre hoy.");
    if (!route.stops.length) fail("La ruta no tiene paradas.");
    const existing = await ctx.db
      .query("trips")
      .withIndex("by_route_date", (q) => q.eq("routeId", routeId).eq("date", now.date))
      .unique();
    if (existing) {
      if (existing.status === "completed") fail("El viaje de hoy ya terminó.");
      return existing._id;
    }
    const mine = await ctx.db
      .query("trips")
      .withIndex("by_driver_date", (q) => q.eq("driverId", ctx.user._id).eq("date", now.date))
      .collect();
    if (mine.some((t) => t.status === "in_progress")) fail("Termina primero el viaje que tienes en curso.");

    const tripId = await ctx.db.insert("trips", {
      schoolId: route.schoolId,
      routeId,
      routeName: route.name,
      date: now.date,
      direction: route.direction,
      driverId: ctx.user._id,
      vehicleId: route.vehicleId,
      status: "in_progress",
      startedAt: Date.now(),
      stops: route.stops,
      stopIndex: 0,
      delayMin: 0,
      nearNotified: [],
      notices: [],
    });
    // Hacia el colegio el bus sale ya; desde el colegio primero se aborda.
    if (route.direction === "to_school") {
      const absent = await absentFor(ctx, route.schoolId, now.date, route.direction);
      const ids = route.stops.flatMap((s) => s.studentIds).filter((id) => !absent.has(id));
      await notify(ctx, await guardiansOf(ctx, ids), "El bus ya salió", `La ruta ${route.name} inició su recorrido.`, tripId);
    }
    return tripId;
  },
});

async function myActiveTrip(ctx: QueryCtx & { user: Doc<"users"> }, tripId: Id<"trips">) {
  const trip = await owned(ctx, tripId, ctx.user.schoolId);
  if (trip.driverId !== ctx.user._id) fail("Este viaje no es tuyo.");
  if (trip.status !== "in_progress") fail("El viaje ya terminó.");
  return trip;
}

/** Recalcula la parada siguiente y, si avanzó, el retraso observado. */
async function advance(ctx: MutationCtx, trip: Doc<"trips">, timezone: string) {
  const { statuses, absent } = await loadState(ctx, trip);
  if (trip.direction === "from_school" && !trip.departedAt) return;
  const index = nextStopIndex(trip.stops, trip.direction, statuses, absent);
  if (index === trip.stopIndex) return;
  const patch: Partial<Doc<"trips">> = { stopIndex: index };
  if (index > trip.stopIndex) {
    patch.delayMin = delayAt(trip.stops[index - 1].time, localNow(timezone).minutes);
  }
  await ctx.db.patch(trip._id, patch);
}

/** Un toque por estudiante: subió, bajó, no salió, o deshacer. */
export const mark = driverMutation({
  args: {
    tripId: v.id("trips"),
    studentId: v.id("students"),
    status: v.union(v.literal("boarded"), v.literal("dropped"), v.literal("no_show"), v.literal("undo")),
    method: v.union(v.literal("tap"), v.literal("face")),
  },
  handler: async (ctx, { tripId, studentId, status, method }) => {
    const trip = await myActiveTrip(ctx, tripId);
    const stop = trip.stops.find((s) => s.studentIds.includes(studentId));
    if (!stop) fail("Ese estudiante no va en este viaje.");
    const existing = (
      await ctx.db.query("boardings").withIndex("by_trip", (q) => q.eq("tripId", tripId)).collect()
    ).find((b) => b.studentId === studentId);
    const now = Date.now();

    if (status === "undo") {
      if (!existing) return null;
      // Desde el colegio, deshacer "bajó" lo devuelve a bordo; en lo demás, a pendiente.
      if (existing.status === "dropped" && trip.direction === "from_school") {
        await ctx.db.patch(existing._id, { status: "boarded", at: now });
      } else {
        await ctx.db.delete(existing._id);
      }
    } else {
      if (status === "dropped" && existing?.status !== "boarded") fail("Primero debe estar a bordo.");
      if (existing?.status === status) return null;
      let boardingId = existing?._id;
      if (existing) {
        await ctx.db.patch(existing._id, {
          status, method, at: now, boardedAt: status === "boarded" ? now : existing.boardedAt,
        });
      } else {
        boardingId = await ctx.db.insert("boardings", {
          schoolId: trip.schoolId, tripId, studentId, stopId: stop.id, status, method, at: now,
          boardedAt: status === "boarded" ? now : undefined,
        });
      }
      await ctx.scheduler.runAfter(UNDO_WINDOW_MS, internal.trips.announce, {
        boardingId: boardingId!, status, at: now,
      });
    }
    await advance(ctx, trip, ctx.school.timezone);
    return null;
  },
});

/** Avisa a la familia solo si el registro sigue igual tras la ventana para deshacer. */
export const announce = internalMutation({
  args: {
    boardingId: v.id("boardings"),
    status: v.union(v.literal("boarded"), v.literal("dropped"), v.literal("no_show")),
    at: v.number(),
  },
  handler: async (ctx, { boardingId, status, at }) => {
    const boarding = await ctx.db.get(boardingId);
    if (!boarding || boarding.status !== status || boarding.at !== at) return;
    const [student, trip] = await Promise.all([ctx.db.get(boarding.studentId), ctx.db.get(boarding.tripId)]);
    if (!student || !trip) return;
    const stopName = trip.stops.find((s) => s.id === boarding.stopId)?.name ?? "su parada";
    const first = student.name.split(" ")[0];
    const text =
      status === "boarded"
        ? [`${first} subió al bus`, `Ruta ${trip.routeName}.`]
        : status === "dropped"
          ? [`${first} fue entregado`, `Bajó en ${stopName}.`]
          : [`${first} no abordó`, trip.direction === "to_school" ? `No salió en ${stopName}.` : "No subió al bus en el colegio."];
    await notify(ctx, await guardiansOf(ctx, [student._id]), text[0], text[1], trip._id);
  },
});

/** Desde el colegio: cierra el abordaje. Quien no subió queda como "no abordó". */
export const depart = driverMutation({
  args: { tripId: v.id("trips") },
  handler: async (ctx, { tripId }) => {
    const trip = await myActiveTrip(ctx, tripId);
    if (trip.direction !== "from_school" || trip.departedAt) return null;
    const { statuses, absent } = await loadState(ctx, trip);
    const now = Date.now();
    const aboard: Id<"students">[] = [];
    for (const stop of trip.stops) {
      for (const studentId of stop.studentIds) {
        const status = studentStatus(studentId, statuses, absent);
        if (status === "boarded") aboard.push(studentId);
        if (status !== "expected") continue;
        const boardingId = await ctx.db.insert("boardings", {
          schoolId: trip.schoolId, tripId, studentId, stopId: stop.id, status: "no_show", method: "tap", at: now,
        });
        await ctx.scheduler.runAfter(0, internal.trips.announce, { boardingId, status: "no_show", at: now });
      }
    }
    await ctx.db.patch(tripId, { departedAt: now });
    await notify(ctx, await guardiansOf(ctx, aboard), "El bus ya salió del colegio", `La ruta ${trip.routeName} inició su recorrido.`, tripId);
    await advance(ctx, { ...trip, departedAt: now }, ctx.school.timezone);
    return null;
  },
});

async function complete(ctx: MutationCtx, trip: Doc<"trips">) {
  const { statuses, absent } = await loadState(ctx, trip);
  const counts = tally(trip.stops, statuses, absent);
  await ctx.db.patch(trip._id, {
    status: "completed",
    endedAt: Date.now(),
    stopIndex: trip.stops.length,
    summary: { total: counts.total, dropped: counts.dropped, noShow: counts.no_show, absent: counts.absent },
  });
  const position = await ctx.db.query("positions").withIndex("by_trip", (q) => q.eq("tripId", trip._id)).unique();
  if (position) await ctx.db.delete(position._id);
}

/**
 * Termina el viaje. Hacia el colegio: todos los que van a bordo llegan al colegio
 * y los que quedaron pendientes pasan a "no abordó". Desde el colegio: exige que nadie siga a bordo.
 */
export const finish = driverMutation({
  args: { tripId: v.id("trips") },
  handler: async (ctx, { tripId }) => {
    const trip = await myActiveTrip(ctx, tripId);
    const { boardings, statuses, absent } = await loadState(ctx, trip);
    const now = Date.now();
    if (trip.direction === "from_school") {
      const aboard = boardings.filter((b) => b.status === "boarded").length;
      if (aboard) fail(aboard === 1 ? "Aún hay 1 estudiante a bordo." : `Aún hay ${aboard} estudiantes a bordo.`);
    } else {
      const arrived: Id<"students">[] = [];
      for (const b of boardings) {
        if (b.status !== "boarded") continue;
        await ctx.db.patch(b._id, { status: "dropped", at: now });
        arrived.push(b.studentId);
      }
      for (const stop of trip.stops) {
        for (const studentId of stop.studentIds) {
          if (studentStatus(studentId, statuses, absent) !== "expected") continue;
          const boardingId = await ctx.db.insert("boardings", {
            schoolId: trip.schoolId, tripId, studentId, stopId: stop.id, status: "no_show", method: "tap", at: now,
          });
          await ctx.scheduler.runAfter(0, internal.trips.announce, { boardingId, status: "no_show", at: now });
        }
      }
      for (const studentId of arrived) {
        const student = await ctx.db.get(studentId);
        await notify(ctx, await guardiansOf(ctx, [studentId]), `${student!.name.split(" ")[0]} llegó al colegio`, `Ruta ${trip.routeName}.`, tripId);
      }
    }
    await complete(ctx, trip);
    return null;
  },
});

/** Posición del bus. Avisa una sola vez a cada parada cuando el bus está cerca. */
export const position = driverMutation({
  args: {
    tripId: v.id("trips"),
    lat: v.number(),
    lng: v.number(),
    heading: v.optional(v.number()),
    speed: v.optional(v.number()),
  },
  handler: async (ctx, { tripId, ...pos }) => {
    const trip = await myActiveTrip(ctx, tripId);
    if (!(Math.abs(pos.lat) <= 90 && Math.abs(pos.lng) <= 180)) fail("Posición inválida.");
    const current = await ctx.db.query("positions").withIndex("by_trip", (q) => q.eq("tripId", tripId)).unique();
    const doc = { ...pos, at: Date.now() };
    if (current) await ctx.db.replace(current._id, { ...doc, schoolId: trip.schoolId, tripId });
    else await ctx.db.insert("positions", { ...doc, schoolId: trip.schoolId, tripId });

    if (trip.direction === "from_school" && !trip.departedAt) return null;
    const near = trip.stops
      .slice(trip.stopIndex)
      .filter((s) => !trip.nearNotified.includes(s.id) && distance(s, pos) <= NEAR_METERS);
    if (!near.length) return null;
    const { statuses, absent } = await loadState(ctx, trip);
    const waiting = trip.direction === "to_school" ? "expected" : "boarded";
    for (const stop of near) {
      const ids = stop.studentIds.filter((id) => studentStatus(id, statuses, absent) === waiting);
      await notify(ctx, await guardiansOf(ctx, ids), "El bus está por llegar", `Ya está cerca de ${stop.name}.`, tripId);
    }
    await ctx.db.patch(tripId, { nearNotified: [...trip.nearNotified, ...near.map((s) => s.id)] });
    return null;
  },
});

/** Aviso del conductor: retraso, avería u otro. */
export const notice = driverMutation({
  args: {
    tripId: v.id("trips"),
    kind: v.union(v.literal("delay"), v.literal("breakdown"), v.literal("other")),
    message: v.string(),
    toFamilies: v.boolean(),
  },
  handler: async (ctx, { tripId, kind, toFamilies, ...args }) => {
    const trip = await myActiveTrip(ctx, tripId);
    if (trip.notices.length >= 20) fail("Ya enviaste muchos avisos en este viaje.");
    const label = { delay: "Retraso", breakdown: "Avería", other: "Aviso" }[kind];
    const message = clean(args.message, 240) || label;
    await ctx.db.patch(tripId, { notices: [...trip.notices, { kind, message, toFamilies, at: Date.now() }] });
    await notify(ctx, await adminsOf(ctx, trip.schoolId), `${label} en ${trip.routeName}`, message, tripId);
    if (toFamilies) {
      const { statuses, absent } = await loadState(ctx, trip);
      const ids = trip.stops
        .flatMap((s) => s.studentIds)
        .filter((id) => ["expected", "boarded"].includes(studentStatus(id, statuses, absent)));
      await notify(ctx, await guardiansOf(ctx, ids), `${label} en la ruta ${trip.routeName}`, message, tripId);
    }
    return null;
  },
});

// ───────────────────────── Detalle (conductor y coordinador) ─────────────────────────

export const detail = userQuery({
  args: { tripId: v.id("trips") },
  handler: async (ctx, { tripId }) => {
    const trip = await owned(ctx, tripId, ctx.user.schoolId);
    if (ctx.user.role === "parent") fail("No tienes permiso para esto.");
    if (ctx.user.role === "driver" && trip.driverId !== ctx.user._id) fail("Este viaje no es tuyo.");
    const { boardings, statuses, absent } = await loadState(ctx, trip);
    const byStudent = new Map(boardings.map((b) => [b.studentId, b]));
    const [driver, vehicle, faces] = await Promise.all([
      ctx.db.get(trip.driverId),
      trip.vehicleId ? ctx.db.get(trip.vehicleId) : null,
      ctx.db.query("faces").withIndex("by_school", (q) => q.eq("schoolId", trip.schoolId)).collect(),
    ]);
    const withFace = new Set(faces.map((f) => f.studentId));
    const stops = await Promise.all(
      trip.stops.map(async (s) => ({
        id: s.id,
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        time: s.time,
        eta: eta(s.time, trip.delayMin),
        students: await Promise.all(
          s.studentIds.map(async (id) => {
            const student = await ctx.db.get(id);
            return {
              _id: id,
              name: student?.name ?? "Estudiante",
              grade: student?.grade ?? "",
              note: student?.note,
              hasFace: withFace.has(id),
              status: studentStatus(id, statuses, absent),
              at: byStudent.get(id)?.at,
              method: byStudent.get(id)?.method,
            };
          }),
        ),
      })),
    );
    return {
      _id: trip._id,
      routeName: trip.routeName,
      date: trip.date,
      direction: trip.direction,
      status: trip.status,
      startedAt: trip.startedAt,
      endedAt: trip.endedAt,
      departedAt: trip.departedAt,
      stopIndex: trip.stopIndex,
      delayMin: trip.delayMin,
      notices: trip.notices,
      counts: tally(trip.stops, statuses, absent),
      driver: driver && { name: driver.name, phone: driver.phone },
      vehicle: vehicle && { name: vehicle.name, plate: vehicle.plate, capacity: vehicle.capacity },
      school: ctx.school.location ?? null,
      stops,
    };
  },
});

/** Posición en vivo de un viaje. Consulta aparte: cambia cada 10 s. */
export const livePosition = userQuery({
  args: { tripId: v.id("trips") },
  handler: async (ctx, { tripId }) => {
    const trip = await owned(ctx, tripId, ctx.user.schoolId);
    if (ctx.user.role === "driver" && trip.driverId !== ctx.user._id) fail("Este viaje no es tuyo.");
    if (ctx.user.role === "parent") {
      const links = await ctx.db.query("guardians").withIndex("by_user", (q) => q.eq("userId", ctx.user._id)).collect();
      const mine = new Set<string>(links.map((l) => l.studentId));
      if (!trip.stops.some((s) => s.studentIds.some((id) => mine.has(id)))) fail("No tienes permiso para esto.");
    }
    const p = await ctx.db.query("positions").withIndex("by_trip", (q) => q.eq("tripId", tripId)).unique();
    return p && { lat: p.lat, lng: p.lng, heading: p.heading, speed: p.speed, at: p.at };
  },
});

// ───────────────────────── Coordinador ─────────────────────────

/** La operación del día: viajes, rutas sin iniciar y ausencias. */
export const today = adminQuery({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    if (!isDate(date)) fail("Fecha inválida.");
    const schoolId = ctx.school._id;
    const [routes, trips, absences, users, vehicles] = await Promise.all([
      ctx.db.query("routes").withIndex("by_school", (q) => q.eq("schoolId", schoolId)).collect(),
      ctx.db.query("trips").withIndex("by_school_date", (q) => q.eq("schoolId", schoolId).eq("date", date)).collect(),
      ctx.db.query("absences").withIndex("by_school_to", (q) => q.eq("schoolId", schoolId).gte("to", date)).collect(),
      ctx.db.query("users").withIndex("by_school_role", (q) => q.eq("schoolId", schoolId).eq("role", "driver")).collect(),
      ctx.db.query("vehicles").withIndex("by_school", (q) => q.eq("schoolId", schoolId)).collect(),
    ]);
    const driverName = new Map(users.map((u) => [u._id, u.name]));
    const vehicleName = new Map(vehicles.map((x) => [x._id, x.name]));
    const started = new Set(trips.map((t) => t.routeId));

    const tripRows = await Promise.all(
      trips.map(async (t) => {
        const { statuses, absent } = await loadState(ctx, t);
        return {
          _id: t._id,
          routeName: t.routeName,
          direction: t.direction,
          status: t.status,
          startedAt: t.startedAt,
          endedAt: t.endedAt,
          departedAt: t.departedAt,
          delayMin: t.delayMin,
          stopIndex: t.stopIndex,
          stops: t.stops.length,
          nextStop: t.stops[t.stopIndex]?.name ?? null,
          driverName: driverName.get(t.driverId) ?? "—",
          vehicleName: (t.vehicleId && vehicleName.get(t.vehicleId)) ?? null,
          counts: tally(t.stops, statuses, absent),
          notices: t.notices,
        };
      }),
    );
    const pending = routes
      .filter((r) => runsOn(r, weekdayOf(date)) && !started.has(r._id))
      .map((r) => ({
        routeId: r._id,
        name: r.name,
        direction: r.direction,
        startTime: r.startTime,
        driverName: (r.driverId && driverName.get(r.driverId)) ?? null,
        vehicleName: (r.vehicleId && vehicleName.get(r.vehicleId)) ?? null,
        students: r.stops.reduce((n, s) => n + s.studentIds.length, 0),
      }));
    const todays = absences.filter((a) => a.from <= date);
    const absenceRows = await Promise.all(
      todays.map(async (a) => {
        const student = await ctx.db.get(a.studentId);
        return { _id: a._id, studentName: student?.name ?? "—", grade: student?.grade ?? "", direction: a.direction, note: a.note, from: a.from, to: a.to };
      }),
    );
    return {
      trips: tripRows.sort((a, b) => a.startedAt - b.startedAt),
      pending: pending.sort((a, b) => a.startTime.localeCompare(b.startTime)),
      absences: absenceRows,
    };
  },
});

/** Posiciones de todos los buses en viaje (mapa en vivo). */
export const livePositions = adminQuery({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("positions")
      .withIndex("by_school", (q) => q.eq("schoolId", ctx.school._id))
      .collect();
    return rows.map((p) => ({ tripId: p.tripId, lat: p.lat, lng: p.lng, heading: p.heading, at: p.at }));
  },
});

/** Historial de viajes entre dos fechas (máximo 62 días). */
export const history = adminQuery({
  args: { from: v.string(), to: v.string() },
  handler: async (ctx, { from, to }) => {
    if (!isDate(from) || !isDate(to) || from > to) fail("Rango de fechas inválido.");
    if (Date.parse(to) - Date.parse(from) > 62 * 86400000) fail("Consulta máximo 2 meses a la vez.");
    const trips = await ctx.db
      .query("trips")
      .withIndex("by_school_date", (q) => q.eq("schoolId", ctx.school._id).gte("date", from).lte("date", to))
      .collect();
    const drivers = new Map<string, string>();
    for (const t of trips) {
      if (!drivers.has(t.driverId)) drivers.set(t.driverId, (await ctx.db.get(t.driverId))?.name ?? "—");
    }
    return trips
      .sort((a, b) => b.date.localeCompare(a.date) || b.startedAt - a.startedAt)
      .map((t) => ({
        _id: t._id, date: t.date, routeName: t.routeName, direction: t.direction, status: t.status,
        startedAt: t.startedAt, endedAt: t.endedAt, driverName: drivers.get(t.driverId)!,
        summary: t.summary ?? null,
      }));
  },
});

/** El coordinador cierra un viaje que quedó abierto. */
export const close = adminMutation({
  args: { tripId: v.id("trips") },
  handler: async (ctx, { tripId }) => {
    const trip = await owned(ctx, tripId, ctx.school._id);
    if (trip.status === "in_progress") await complete(ctx, trip);
    return null;
  },
});

// ───────────────────────── Tareas programadas ─────────────────────────

/** Avisa al coordinador de rutas que no han iniciado 10 minutos después de su hora. */
export const lateStarts = internalMutation({
  args: {},
  handler: async (ctx) => {
    for await (const school of ctx.db.query("schools")) {
      const now = localNow(school.timezone);
      const routes = await ctx.db.query("routes").withIndex("by_school", (q) => q.eq("schoolId", school._id)).collect();
      for (const route of routes) {
        if (!runsOn(route, now.weekday) || route.lateAlertDate === now.date) continue;
        const [h, m] = route.startTime.split(":").map(Number);
        const late = now.minutes - (h * 60 + m);
        if (late < 10 || late > 120) continue;
        const trip = await ctx.db
          .query("trips")
          .withIndex("by_route_date", (q) => q.eq("routeId", route._id).eq("date", now.date))
          .unique();
        await ctx.db.patch(route._id, { lateAlertDate: now.date });
        if (trip) continue;
        await notify(ctx, await adminsOf(ctx, school._id), "Ruta sin iniciar", `${route.name} debía iniciar a las ${route.startTime}.`);
      }
    }
  },
});

/** Limpieza diaria: cierra viajes de días anteriores y borra sesiones vencidas. */
export const cleanup = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    for await (const school of ctx.db.query("schools")) {
      const today = localNow(school.timezone).date;
      const old = await ctx.db
        .query("trips")
        .withIndex("by_school_date", (q) => q.eq("schoolId", school._id).lt("date", today))
        .order("desc")
        .take(200);
      for (const trip of old) if (trip.status === "in_progress") await complete(ctx, trip);
    }
    const sessions = await ctx.db.query("sessions").take(2000);
    for (const s of sessions) if (s.expiresAt < now) await ctx.db.delete(s._id);
  },
});
