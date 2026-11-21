// Viajes: la ejecución de una ruta en una fecha (PRD §6).
import { and, desc, eq, gte, inArray, lt, lte } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/db/client";
import * as t from "@/db/schema";
import type { Stop } from "@/db/schema";
import { isDate, localNow, toMinutes, toTime } from "@/lib/dates";
import { distance } from "@/lib/geo";
import { type Boarding, delayAt, eta, nextStopIndex, runsOn, stopResolved, studentStatus, tally } from "@/lib/roster";
import {
  type AuthCtx, type Tools, adminMutation, adminQuery, clean, driverMutation, driverQuery, fail, noArgs, owned, userQuery, uuid,
} from "./core";
import { absentFor, adminsOf, guardiansOf, notify } from "./shared";

const NEAR_METERS = 500;
const UNDO_WINDOW_MS = 8000; // el aviso a la familia espera por si el conductor deshace
const LEARN_FROM = 10; // viajes recientes que alimentan la hora típica de una parada
const LEARN_MIN = 3; // con menos datos se usa la hora prevista

type Trip = typeof t.trips.$inferSelect;
type StatusMap = Map<string, Boarding["status"]>;

async function loadState(db: Db, trip: Trip) {
  const boardings = await db.select().from(t.boardings).where(eq(t.boardings.tripId, trip.id));
  const statuses: StatusMap = new Map(boardings.map((b) => [b.studentId, b.status]));
  const absent = await absentFor(db, trip.schoolId, trip.date, trip.direction);
  return { boardings, statuses, absent };
}

const weekdayOf = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay();
const firstName = (name: string) => name.split(" ")[0];

/**
 * Hora típica de cada parada: la mediana de las llegadas reales de los últimos viajes.
 * Así la hora estimada incluye el tráfico habitual de esa ruta sin consultar a nadie.
 */
async function withLearnedTimes(db: Db, routeId: string, stops: Stop[]): Promise<Stop[]> {
  const rows = await db
    .select({ stopId: t.stopTimes.stopId, actualMin: t.stopTimes.actualMin })
    .from(t.stopTimes)
    .where(eq(t.stopTimes.routeId, routeId))
    .orderBy(desc(t.stopTimes.date))
    .limit(LEARN_FROM * 60);
  const byStop = new Map<string, number[]>();
  for (const r of rows) {
    const list = byStop.get(r.stopId) ?? [];
    if (list.length < LEARN_FROM) list.push(r.actualMin);
    byStop.set(r.stopId, list);
  }
  return stops.map((s) => {
    const seen = (byStop.get(s.id) ?? []).sort((a, b) => a - b);
    const learned = seen.length >= LEARN_MIN ? toTime(seen[Math.floor(seen.length / 2)]) : s.time;
    return { ...s, planned: s.time, time: learned };
  });
}

// ───────────────────────── Conductor ─────────────────────────

/** Rutas del conductor para una fecha, con su viaje si ya existe. */
export const myDay = driverQuery(z.object({ date: z.string() }), async (ctx, { date }) => {
  if (!isDate(date)) fail("Fecha inválida.");
  ctx.watch("routes", "trips", "absences", "team");
  const routes = (await ctx.db.select().from(t.routes).where(eq(t.routes.driverId, ctx.user.id))).filter((r) => runsOn(r, weekdayOf(date)));
  const trips = await ctx.db.select().from(t.trips).where(and(eq(t.trips.driverId, ctx.user.id), eq(t.trips.date, date)));
  const vehicles = await ctx.db.select().from(t.vehicles).where(eq(t.vehicles.schoolId, ctx.school.id));
  const result = await Promise.all(
    routes.map(async (r) => {
      const trip = trips.find((x) => x.routeId === r.id);
      const absent = await absentFor(ctx.db, r.schoolId, date, r.direction);
      const ids = r.stops.flatMap((s) => s.studentIds);
      const vehicle = vehicles.find((v) => v.id === r.vehicleId);
      return {
        routeId: r.id,
        name: r.name,
        direction: r.direction,
        startTime: r.startTime,
        stops: r.stops.length,
        expected: ids.filter((id) => !absent.has(id)).length,
        absent: ids.filter((id) => absent.has(id)).length,
        vehicle: vehicle ? { name: vehicle.name, plate: vehicle.plate } : null,
        trip: trip ? { id: trip.id, status: trip.status } : null,
      };
    }),
  );
  return result.sort((a, b) => a.startTime.localeCompare(b.startTime));
});

export const start = driverMutation(z.object({ routeId: uuid }), async (ctx, { routeId }) => {
  const route = await owned(ctx, "routes", routeId);
  if (route.driverId !== ctx.user.id) fail("Esta ruta no está asignada a ti.");
  const now = localNow(ctx.school.timezone, ctx.now);
  if (!runsOn(route, now.weekday)) fail("Esta ruta no corre hoy.");
  if (!route.stops.length) fail("La ruta no tiene paradas.");
  const [existing] = await ctx.db.select().from(t.trips).where(and(eq(t.trips.routeId, routeId), eq(t.trips.date, now.date)));
  if (existing) {
    if (existing.status === "completed") fail("El viaje de hoy ya terminó.");
    return existing.id;
  }
  const mine = await ctx.db.select({ status: t.trips.status }).from(t.trips).where(and(eq(t.trips.driverId, ctx.user.id), eq(t.trips.date, now.date)));
  if (mine.some((x) => x.status === "in_progress")) fail("Termina primero el viaje que tienes en curso.");

  const stops = await withLearnedTimes(ctx.db, route.id, route.stops);
  const toSchool = route.direction === "to_school";
  const inserted = await ctx.db
    .insert(t.trips)
    .values({
      schoolId: route.schoolId, routeId, routeName: route.name, date: now.date, direction: route.direction,
      driverId: ctx.user.id, vehicleId: route.vehicleId, status: "in_progress", startedAt: ctx.now,
      stops, path: route.path,
      predicted: toSchool ? { [stops[0].id]: toMinutes(stops[0].time) } : {},
    })
    .onConflictDoNothing({ target: [t.trips.routeId, t.trips.date] })
    .returning({ id: t.trips.id });
  if (!inserted.length) fail("El viaje de hoy ya fue iniciado. Vuelve a abrir tus viajes.");
  const tripId = inserted[0].id;
  // Hacia el colegio el bus sale ya; desde el colegio primero se aborda.
  if (toSchool) {
    const absent = await absentFor(ctx.db, route.schoolId, now.date, route.direction);
    const ids = route.stops.flatMap((s) => s.studentIds).filter((id) => !absent.has(id));
    await notify(ctx, route.schoolId, await guardiansOf(ctx.db, ids), "El bus ya salió", `La ruta ${route.name} inició su recorrido.`, tripId);
  }
  ctx.touch("trips");
  return tripId;
});

async function myActiveTrip(ctx: AuthCtx, tripId: string) {
  const trip = await owned(ctx, "trips", tripId);
  if (trip.driverId !== ctx.user.id) fail("Este viaje no es tuyo.", 403);
  if (trip.status !== "in_progress") fail("El viaje ya terminó.");
  return trip;
}

/**
 * Recalcula la parada siguiente. Si avanzó, actualiza el retraso observado y deja
 * registrada la hora real de la parada visitada (para aprender y medir el error).
 */
async function advance(ctx: AuthCtx, trip: Trip, visitedStopId?: string) {
  if (trip.direction === "from_school" && !trip.departedAt) return;
  const { statuses, absent } = await loadState(ctx.db, trip);
  const nowMin = localNow(ctx.school.timezone, ctx.now).minutes;

  const visited = trip.stops.find((s) => s.id === visitedStopId);
  if (visited) {
    const recorded = await ctx.db
      .select({ id: t.stopTimes.id })
      .from(t.stopTimes)
      .where(and(eq(t.stopTimes.tripId, trip.id), eq(t.stopTimes.stopId, visited.id)));
    const resolved = stopResolved(visited, trip.direction, statuses, absent);
    if (resolved && !recorded.length) {
      await ctx.db.insert(t.stopTimes).values({
        schoolId: trip.schoolId, routeId: trip.routeId, tripId: trip.id, stopId: visited.id, date: trip.date,
        plannedMin: toMinutes(visited.planned ?? visited.time),
        predictedMin: trip.predicted[visited.id] ?? null,
        actualMin: nowMin,
      });
    } else if (!resolved && recorded.length) {
      // Se deshizo un registro: la parada vuelve a estar pendiente.
      await ctx.db.delete(t.stopTimes).where(and(eq(t.stopTimes.tripId, trip.id), eq(t.stopTimes.stopId, visited.id)));
    }
  }

  const index = nextStopIndex(trip.stops, trip.direction, statuses, absent);
  if (index === trip.stopIndex) return;
  const patch: Partial<Trip> = { stopIndex: index };
  if (index > trip.stopIndex) {
    patch.delayMin = delayAt(trip.stops[index - 1].time, nowMin);
    const next = trip.stops[index];
    if (next) patch.predicted = { ...trip.predicted, [next.id]: toMinutes(next.time) + patch.delayMin };
  }
  await ctx.db.update(t.trips).set(patch).where(eq(t.trips.id, trip.id));
}

/** Un toque por estudiante: subió, bajó, no salió, o deshacer. */
export const mark = driverMutation(
  z.object({ tripId: uuid, studentId: uuid, status: z.enum(["boarded", "dropped", "no_show", "undo"]), method: z.enum(["tap", "face"]) }),
  async (ctx, { tripId, studentId, status, method }) => {
    const trip = await myActiveTrip(ctx, tripId);
    const stop = trip.stops.find((s) => s.studentIds.includes(studentId));
    if (!stop) fail("Ese estudiante no va en este viaje.");
    const [existing] = await ctx.db.select().from(t.boardings).where(and(eq(t.boardings.tripId, tripId), eq(t.boardings.studentId, studentId)));

    if (status === "undo") {
      if (!existing) return null;
      // Desde el colegio, deshacer "bajó" lo devuelve a bordo; en lo demás, a pendiente.
      if (existing.status === "dropped" && trip.direction === "from_school") {
        await ctx.db.update(t.boardings).set({ status: "boarded", at: ctx.now }).where(eq(t.boardings.id, existing.id));
      } else {
        await ctx.db.delete(t.boardings).where(eq(t.boardings.id, existing.id));
      }
    } else {
      if (status === "dropped" && existing?.status !== "boarded") fail("Primero debe estar a bordo.");
      if (existing?.status === status) return null;
      const boardedAt = status === "boarded" ? ctx.now : (existing?.boardedAt ?? null);
      const [row] = await ctx.db
        .insert(t.boardings)
        .values({ schoolId: trip.schoolId, tripId, studentId, stopId: stop.id, status, method, at: ctx.now, boardedAt })
        .onConflictDoUpdate({ target: [t.boardings.tripId, t.boardings.studentId], set: { status, method, at: ctx.now, boardedAt } })
        .returning({ id: t.boardings.id });
      await ctx.enqueue("announce", { boardingId: row.id, status, at: ctx.now }, UNDO_WINDOW_MS);
    }
    await advance(ctx, trip, stop.id);
    ctx.touch("trips");
    return null;
  },
);

/** Avisa a la familia solo si el registro sigue igual tras la ventana para deshacer. */
export async function announce(tools: Tools, payload: { boardingId: string; status: string; at: number }) {
  const [row] = await tools.db
    .select({ boarding: t.boardings, student: t.students, trip: t.trips })
    .from(t.boardings)
    .innerJoin(t.students, eq(t.students.id, t.boardings.studentId))
    .innerJoin(t.trips, eq(t.trips.id, t.boardings.tripId))
    .where(eq(t.boardings.id, payload.boardingId));
  if (!row || row.boarding.status !== payload.status || row.boarding.at !== payload.at) return;
  const { boarding, student, trip } = row;
  const stopName = trip.stops.find((s) => s.id === boarding.stopId)?.name ?? "su parada";
  const first = firstName(student.name);
  const text =
    boarding.status === "boarded"
      ? [`${first} subió al bus`, `Ruta ${trip.routeName}.`]
      : boarding.status === "dropped"
        ? [`${first} fue entregado`, `Bajó en ${stopName}.`]
        : [`${first} no abordó`, trip.direction === "to_school" ? `No salió en ${stopName}.` : "No subió al bus en el colegio."];
  await notify(tools, trip.schoolId, await guardiansOf(tools.db, [student.id]), text[0], text[1], trip.id);
}

/** Marca como "no abordó" a quienes siguen pendientes y avisa a sus familias. */
async function closePending(ctx: AuthCtx, trip: Trip, statuses: StatusMap, absent: Set<string>) {
  for (const stop of trip.stops) {
    for (const studentId of stop.studentIds) {
      if (studentStatus(studentId, statuses, absent) !== "expected") continue;
      const [row] = await ctx.db
        .insert(t.boardings)
        .values({ schoolId: trip.schoolId, tripId: trip.id, studentId, stopId: stop.id, status: "no_show", method: "tap", at: ctx.now })
        .returning({ id: t.boardings.id });
      await ctx.enqueue("announce", { boardingId: row.id, status: "no_show", at: ctx.now });
    }
  }
}

/** Desde el colegio: cierra el abordaje. Quien no subió queda como "no abordó". */
export const depart = driverMutation(z.object({ tripId: uuid }), async (ctx, { tripId }) => {
  const trip = await myActiveTrip(ctx, tripId);
  if (trip.direction !== "from_school" || trip.departedAt) return null;
  const { statuses, absent } = await loadState(ctx.db, trip);
  const aboard = trip.stops.flatMap((s) => s.studentIds).filter((id) => studentStatus(id, statuses, absent) === "boarded");
  await closePending(ctx, trip, statuses, absent);
  const first = trip.stops.find((s) => s.studentIds.some((id) => aboard.includes(id)));
  const predicted = first ? { ...trip.predicted, [first.id]: toMinutes(first.time) } : trip.predicted;
  await ctx.db.update(t.trips).set({ departedAt: ctx.now, predicted }).where(eq(t.trips.id, tripId));
  await notify(ctx, trip.schoolId, await guardiansOf(ctx.db, aboard), "El bus ya salió del colegio", `La ruta ${trip.routeName} inició su recorrido.`, tripId);
  await advance(ctx, { ...trip, departedAt: ctx.now, predicted });
  ctx.touch("trips");
  return null;
});

async function complete(tools: Tools, trip: Trip) {
  const { statuses, absent } = await loadState(tools.db, trip);
  const counts = tally(trip.stops, statuses, absent);
  await tools.db
    .update(t.trips)
    .set({
      status: "completed", endedAt: tools.now, stopIndex: trip.stops.length,
      summary: { total: counts.total, dropped: counts.dropped, noShow: counts.no_show, absent: counts.absent },
    })
    .where(eq(t.trips.id, trip.id));
  await tools.db.delete(t.positions).where(eq(t.positions.tripId, trip.id));
  tools.emit(trip.schoolId, "trips", "positions", `pos:${trip.id}`);
}

/**
 * Termina el viaje. Hacia el colegio: todos los que van a bordo llegan al colegio
 * y los que quedaron pendientes pasan a "no abordó". Desde el colegio: exige que nadie siga a bordo.
 */
export const finish = driverMutation(z.object({ tripId: uuid }), async (ctx, { tripId }) => {
  const trip = await myActiveTrip(ctx, tripId);
  const { boardings, statuses, absent } = await loadState(ctx.db, trip);
  const aboard = boardings.filter((b) => b.status === "boarded");
  if (trip.direction === "from_school") {
    if (aboard.length) fail(aboard.length === 1 ? "Aún hay 1 estudiante a bordo." : `Aún hay ${aboard.length} estudiantes a bordo.`);
  } else {
    if (aboard.length) {
      await ctx.db.update(t.boardings).set({ status: "dropped", at: ctx.now }).where(inArray(t.boardings.id, aboard.map((b) => b.id)));
      const students = await ctx.db.select({ id: t.students.id, name: t.students.name }).from(t.students).where(inArray(t.students.id, aboard.map((b) => b.studentId)));
      for (const s of students) {
        await notify(ctx, trip.schoolId, await guardiansOf(ctx.db, [s.id]), `${firstName(s.name)} llegó al colegio`, `Ruta ${trip.routeName}.`, tripId);
      }
    }
    await closePending(ctx, trip, statuses, absent);
  }
  await complete(ctx, trip);
  return null;
});

/** Posición del bus. Avisa una sola vez a cada parada cuando el bus está cerca. */
export const position = driverMutation(
  z.object({
    tripId: uuid,
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    heading: z.number().optional(),
    speed: z.number().optional(),
  }),
  async (ctx, { tripId, ...pos }) => {
    const trip = await myActiveTrip(ctx, tripId);
    const row = { lat: pos.lat, lng: pos.lng, heading: pos.heading ?? null, speed: pos.speed ?? null, at: ctx.now };
    await ctx.db
      .insert(t.positions)
      .values({ ...row, tripId, schoolId: trip.schoolId })
      .onConflictDoUpdate({ target: t.positions.tripId, set: row });
    ctx.touch("positions", `pos:${tripId}`);

    if (trip.direction === "from_school" && !trip.departedAt) return null;
    const near = trip.stops.slice(trip.stopIndex).filter((s) => !trip.nearNotified.includes(s.id) && distance(s, pos) <= NEAR_METERS);
    if (!near.length) return null;
    const { statuses, absent } = await loadState(ctx.db, trip);
    const waiting = trip.direction === "to_school" ? "expected" : "boarded";
    for (const stop of near) {
      const ids = stop.studentIds.filter((id) => studentStatus(id, statuses, absent) === waiting);
      await notify(ctx, trip.schoolId, await guardiansOf(ctx.db, ids), "El bus está por llegar", `Ya está cerca de ${stop.name}.`, tripId);
    }
    await ctx.db.update(t.trips).set({ nearNotified: [...trip.nearNotified, ...near.map((s) => s.id)] }).where(eq(t.trips.id, tripId));
    return null;
  },
);

/** Aviso del conductor: retraso, avería u otro. */
export const notice = driverMutation(
  z.object({ tripId: uuid, kind: z.enum(["delay", "breakdown", "other"]), message: z.string().max(300), toFamilies: z.boolean() }),
  async (ctx, { tripId, kind, toFamilies, ...args }) => {
    const trip = await myActiveTrip(ctx, tripId);
    if (trip.notices.length >= 20) fail("Ya enviaste muchos avisos en este viaje.");
    const label = { delay: "Retraso", breakdown: "Avería", other: "Aviso" }[kind];
    const message = clean(args.message, 240) || label;
    await ctx.db.update(t.trips).set({ notices: [...trip.notices, { kind, message, toFamilies, at: ctx.now }] }).where(eq(t.trips.id, tripId));
    await notify(ctx, trip.schoolId, await adminsOf(ctx.db, trip.schoolId), `${label} en ${trip.routeName}`, message, tripId);
    if (toFamilies) {
      const { statuses, absent } = await loadState(ctx.db, trip);
      const ids = trip.stops.flatMap((s) => s.studentIds).filter((id) => ["expected", "boarded"].includes(studentStatus(id, statuses, absent)));
      await notify(ctx, trip.schoolId, await guardiansOf(ctx.db, ids), `${label} en la ruta ${trip.routeName}`, message, tripId);
    }
    ctx.touch("trips");
    return null;
  },
);

// ───────────────────────── Detalle (conductor y coordinador) ─────────────────────────

export const detail = userQuery(z.object({ tripId: uuid }), async (ctx, { tripId }) => {
  ctx.watch("trips", "absences", "faces");
  const trip = await owned(ctx, "trips", tripId);
  if (ctx.user.role === "parent") fail("No tienes permiso para esto.", 403);
  if (ctx.user.role === "driver" && trip.driverId !== ctx.user.id) fail("Este viaje no es tuyo.", 403);
  const { boardings, statuses, absent } = await loadState(ctx.db, trip);
  const byStudent = new Map(boardings.map((b) => [b.studentId, b]));
  const ids = trip.stops.flatMap((s) => s.studentIds);
  const [students, faces, [driver], vehicles] = await Promise.all([
    ids.length ? ctx.db.select().from(t.students).where(inArray(t.students.id, ids)) : [],
    ids.length ? ctx.db.select({ studentId: t.faces.studentId }).from(t.faces).where(inArray(t.faces.studentId, ids)) : [],
    ctx.db.select({ name: t.users.name, phone: t.users.phone }).from(t.users).where(eq(t.users.id, trip.driverId)),
    trip.vehicleId ? ctx.db.select().from(t.vehicles).where(eq(t.vehicles.id, trip.vehicleId)) : [],
  ]);
  const student = new Map(students.map((s) => [s.id, s]));
  const withFace = new Set(faces.map((f) => f.studentId));
  const vehicle = vehicles[0];
  return {
    id: trip.id,
    routeName: trip.routeName,
    date: trip.date,
    direction: trip.direction,
    status: trip.status,
    startedAt: trip.startedAt,
    endedAt: trip.endedAt ?? undefined,
    departedAt: trip.departedAt ?? undefined,
    stopIndex: trip.stopIndex,
    delayMin: trip.delayMin,
    notices: trip.notices,
    path: trip.path ?? undefined,
    counts: tally(trip.stops, statuses, absent),
    driver: driver ? { name: driver.name, phone: driver.phone ?? undefined } : null,
    vehicle: vehicle ? { name: vehicle.name, plate: vehicle.plate, capacity: vehicle.capacity } : null,
    school: ctx.school.location ?? null,
    stops: trip.stops.map((s) => ({
      id: s.id,
      name: s.name,
      lat: s.lat,
      lng: s.lng,
      time: s.planned ?? s.time,
      eta: eta(s.time, trip.delayMin),
      students: s.studentIds.map((sid) => ({
        id: sid,
        name: student.get(sid)?.name ?? "Estudiante",
        grade: student.get(sid)?.grade ?? "",
        note: student.get(sid)?.note ?? undefined,
        hasFace: withFace.has(sid),
        status: studentStatus(sid, statuses, absent),
        at: byStudent.get(sid)?.at,
        method: byStudent.get(sid)?.method,
      })),
    })),
  };
});

/** Posición en vivo de un viaje. Consulta aparte: cambia cada 10 s. */
export const livePosition = userQuery(z.object({ tripId: uuid }), async (ctx, { tripId }) => {
  ctx.watch(`pos:${tripId}`);
  const trip = await owned(ctx, "trips", tripId);
  if (ctx.user.role === "driver" && trip.driverId !== ctx.user.id) fail("Este viaje no es tuyo.", 403);
  if (ctx.user.role === "parent") {
    const links = await ctx.db.select({ studentId: t.guardians.studentId }).from(t.guardians).where(eq(t.guardians.userId, ctx.user.id));
    const mine = new Set(links.map((l) => l.studentId));
    if (!trip.stops.some((s) => s.studentIds.some((id) => mine.has(id)))) fail("No tienes permiso para esto.", 403);
  }
  const [p] = await ctx.db.select().from(t.positions).where(eq(t.positions.tripId, tripId));
  return p ? { lat: p.lat, lng: p.lng, heading: p.heading ?? undefined, speed: p.speed ?? undefined, at: p.at } : null;
});

// ───────────────────────── Coordinador ─────────────────────────

/** La operación del día: viajes, rutas sin iniciar y ausencias. */
export const today = adminQuery(z.object({ date: z.string() }), async (ctx, { date }) => {
  if (!isDate(date)) fail("Fecha inválida.");
  ctx.watch("trips", "routes", "absences", "team");
  const schoolId = ctx.school.id;
  const [routes, trips, absences, drivers, vehicles] = await Promise.all([
    ctx.db.select().from(t.routes).where(eq(t.routes.schoolId, schoolId)),
    ctx.db.select().from(t.trips).where(and(eq(t.trips.schoolId, schoolId), eq(t.trips.date, date))),
    ctx.db.select().from(t.absences).where(and(eq(t.absences.schoolId, schoolId), gte(t.absences.to, date), lte(t.absences.from, date))),
    ctx.db.select({ id: t.users.id, name: t.users.name }).from(t.users).where(and(eq(t.users.schoolId, schoolId), eq(t.users.role, "driver"))),
    ctx.db.select().from(t.vehicles).where(eq(t.vehicles.schoolId, schoolId)),
  ]);
  const driverName = new Map(drivers.map((u) => [u.id, u.name]));
  const vehicleName = new Map(vehicles.map((x) => [x.id, x.name]));
  const started = new Set(trips.map((x) => x.routeId));

  const tripRows = await Promise.all(
    trips.map(async (x) => {
      const { statuses, absent } = await loadState(ctx.db, x);
      return {
        id: x.id,
        routeName: x.routeName,
        direction: x.direction,
        status: x.status,
        startedAt: x.startedAt,
        endedAt: x.endedAt ?? undefined,
        delayMin: x.delayMin,
        stopIndex: x.stopIndex,
        stops: x.stops.length,
        nextStop: x.stops[x.stopIndex]?.name ?? null,
        driverName: driverName.get(x.driverId) ?? "—",
        vehicleName: (x.vehicleId && vehicleName.get(x.vehicleId)) ?? null,
        counts: tally(x.stops, statuses, absent),
        notices: x.notices,
      };
    }),
  );
  const pending = routes
    .filter((r) => runsOn(r, weekdayOf(date)) && !started.has(r.id))
    .map((r) => ({
      routeId: r.id,
      name: r.name,
      direction: r.direction,
      startTime: r.startTime,
      driverName: (r.driverId && driverName.get(r.driverId)) ?? null,
      vehicleName: (r.vehicleId && vehicleName.get(r.vehicleId)) ?? null,
      students: r.stops.reduce((n, s) => n + s.studentIds.length, 0),
    }));
  const absentStudents = absences.length
    ? await ctx.db.select().from(t.students).where(inArray(t.students.id, absences.map((a) => a.studentId)))
    : [];
  const student = new Map(absentStudents.map((s) => [s.id, s]));
  return {
    trips: tripRows.sort((a, b) => a.startedAt - b.startedAt),
    pending: pending.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    absences: absences.map((a) => ({
      id: a.id, studentName: student.get(a.studentId)?.name ?? "—", grade: student.get(a.studentId)?.grade ?? "",
      direction: a.direction, note: a.note ?? undefined, from: a.from, to: a.to,
    })),
  };
});

/** Posiciones de todos los buses en viaje (mapa en vivo). */
export const livePositions = adminQuery(noArgs, async (ctx) => {
  ctx.watch("positions");
  const rows = await ctx.db.select().from(t.positions).where(eq(t.positions.schoolId, ctx.school.id));
  return rows.map((p) => ({ tripId: p.tripId, lat: p.lat, lng: p.lng, heading: p.heading ?? undefined, at: p.at }));
});

/** Historial de viajes entre dos fechas (máximo 62 días), con la precisión de la hora estimada. */
export const history = adminQuery(z.object({ from: z.string(), to: z.string() }), async (ctx, { from, to }) => {
  if (!isDate(from) || !isDate(to) || from > to) fail("Rango de fechas inválido.");
  if (Date.parse(to) - Date.parse(from) > 62 * 86400000) fail("Consulta máximo 2 meses a la vez.");
  ctx.watch("trips");
  const schoolId = ctx.school.id;
  const [trips, drivers, times] = await Promise.all([
    ctx.db.select().from(t.trips).where(and(eq(t.trips.schoolId, schoolId), gte(t.trips.date, from), lte(t.trips.date, to))),
    ctx.db.select({ id: t.users.id, name: t.users.name }).from(t.users).where(and(eq(t.users.schoolId, schoolId), eq(t.users.role, "driver"))),
    ctx.db.select().from(t.stopTimes).where(and(eq(t.stopTimes.schoolId, schoolId), gte(t.stopTimes.date, from), lte(t.stopTimes.date, to))),
  ]);
  const driverName = new Map(drivers.map((d) => [d.id, d.name]));
  // Error de la hora estimada: diferencia entre lo que se mostró y la llegada real.
  const errors = times.filter((x) => x.predictedMin !== null).map((x) => Math.abs(x.actualMin - x.predictedMin!));
  return {
    etaError: errors.length ? { stops: errors.length, averageMin: Math.round((errors.reduce((a, b) => a + b, 0) / errors.length) * 10) / 10 } : null,
    trips: trips
      .sort((a, b) => b.date.localeCompare(a.date) || b.startedAt - a.startedAt)
      .map((x) => ({
        id: x.id, date: x.date, routeName: x.routeName, direction: x.direction, status: x.status,
        startedAt: x.startedAt, endedAt: x.endedAt ?? undefined, driverName: driverName.get(x.driverId) ?? "—",
        summary: x.summary ?? null,
      })),
  };
});

/** El coordinador cierra un viaje que quedó abierto. */
export const close = adminMutation(z.object({ tripId: uuid }), async (ctx, { tripId }) => {
  const trip = await owned(ctx, "trips", tripId);
  if (trip.status === "in_progress") await complete(ctx, trip);
  await ctx.audit("viaje.cerrar", { tripId });
  return null;
});

// ───────────────────────── Tareas programadas (alcance "system") ─────────────────────────

/** Avisa al coordinador de rutas que no han iniciado 10 minutos después de su hora. */
export async function lateStarts(tools: Tools) {
  const schools = await tools.db.select().from(t.schools);
  for (const school of schools) {
    const now = localNow(school.timezone, tools.now);
    const routes = await tools.db.select().from(t.routes).where(eq(t.routes.schoolId, school.id));
    for (const route of routes) {
      if (!runsOn(route, now.weekday) || route.lateAlertDate === now.date) continue;
      const late = now.minutes - toMinutes(route.startTime);
      if (late < 10 || late > 120) continue;
      const trip = await tools.db.select({ id: t.trips.id }).from(t.trips).where(and(eq(t.trips.routeId, route.id), eq(t.trips.date, now.date)));
      await tools.db.update(t.routes).set({ lateAlertDate: now.date }).where(eq(t.routes.id, route.id));
      if (trip.length) continue;
      await notify(tools, school.id, await adminsOf(tools.db, school.id), "Ruta sin iniciar", `${route.name} debía iniciar a las ${route.startTime}.`);
    }
  }
}

/** Limpieza diaria: cierra viajes de días anteriores y borra lo vencido. */
export async function cleanup(tools: Tools) {
  const schools = await tools.db.select().from(t.schools);
  for (const school of schools) {
    const today = localNow(school.timezone, tools.now).date;
    const old = await tools.db
      .select()
      .from(t.trips)
      .where(and(eq(t.trips.schoolId, school.id), eq(t.trips.status, "in_progress"), lt(t.trips.date, today)));
    for (const trip of old) await complete(tools, trip);
  }
  await tools.db.delete(t.sessions).where(lt(t.sessions.expiresAt, tools.now));
  await tools.db.delete(t.rateLimits).where(lt(t.rateLimits.resetAt, tools.now));
  await tools.db.delete(t.notifications).where(lt(t.notifications.at, tools.now - 90 * 86400000));
}
