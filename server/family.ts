// Vista de la familia: estado de cada hijo hoy, ausencias y actividad.
import { and, eq, gte, inArray } from "drizzle-orm";
import { z } from "zod";
import * as t from "@/db/schema";
import { addDays, isDate, localNow } from "@/lib/dates";
import { covers, eta, runsOn, studentStatus } from "@/lib/roster";
import { type AuthCtx, clean, fail, noArgs, owned, parentQuery, userMutation, uuid } from "./core";
import { absentFor, adminsOf, isGuardian, notify } from "./shared";

async function myChildren(ctx: AuthCtx) {
  return ctx.db
    .select({ student: t.students })
    .from(t.guardians)
    .innerJoin(t.students, eq(t.students.id, t.guardians.studentId))
    .where(and(eq(t.guardians.userId, ctx.user.id), eq(t.students.active, true)))
    .then((rows) => rows.map((r) => r.student));
}

const weekdayOf = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay();

/** Cada hijo con sus trayectos de la fecha (mañana y tarde) y su estado. */
export const home = parentQuery(z.object({ date: z.string() }), async (ctx, { date }) => {
  if (!isDate(date)) fail("Fecha inválida.");
  ctx.watch("trips", "routes", "absences", "faces", "students", "team");
  const schoolId = ctx.school.id;
  const children = await myChildren(ctx);
  const weekday = weekdayOf(date);
  const [routes, trips, people, vehicles] = await Promise.all([
    ctx.db.select().from(t.routes).where(eq(t.routes.schoolId, schoolId)),
    ctx.db.select().from(t.trips).where(and(eq(t.trips.schoolId, schoolId), eq(t.trips.date, date))),
    ctx.db.select({ id: t.users.id, name: t.users.name, phone: t.users.phone }).from(t.users).where(and(eq(t.users.schoolId, schoolId), eq(t.users.role, "driver"))),
    ctx.db.select().from(t.vehicles).where(eq(t.vehicles.schoolId, schoolId)),
  ]);
  const childIds = children.map((c) => c.id);
  const [absences, faces] = childIds.length
    ? await Promise.all([
        ctx.db.select().from(t.absences).where(and(inArray(t.absences.studentId, childIds), gte(t.absences.to, date))),
        ctx.db.select({ studentId: t.faces.studentId }).from(t.faces).where(inArray(t.faces.studentId, childIds)),
      ])
    : [[], []];

  const result = await Promise.all(
    children.map(async (child) => {
      const legs = await Promise.all(
        routes
          .filter((r) => runsOn(r, weekday) && r.stops.some((s) => s.studentIds.includes(child.id)))
          .map(async (route) => {
            const trip = trips.find((x) => x.routeId === route.id);
            // Con viaje iniciado manda su copia de paradas; si no, la ruta.
            const stops = trip?.stops ?? route.stops;
            const stopIndex = stops.findIndex((s) => s.studentIds.includes(child.id));
            const stop = stops[stopIndex];
            const absent = await absentFor(ctx.db, schoolId, date, route.direction);
            let status: ReturnType<typeof studentStatus> = absent.has(child.id) ? "absent" : "expected";
            if (trip) {
              const boardings = await ctx.db.select().from(t.boardings).where(and(eq(t.boardings.tripId, trip.id), eq(t.boardings.studentId, child.id)));
              status = studentStatus(child.id, new Map(boardings.map((b) => [b.studentId, b.status])), absent);
            }
            const driver = people.find((p) => p.id === (trip?.driverId ?? route.driverId));
            const vehicle = vehicles.find((v) => v.id === (trip?.vehicleId ?? route.vehicleId));
            return {
              routeName: route.name,
              direction: route.direction,
              startTime: route.startTime,
              // Solo la parada propia: las demás son domicilios de otras familias.
              stop: stop ? { id: stop.id, name: stop.name, lat: stop.lat, lng: stop.lng, time: stop.time } : null,
              eta: stop ? eta(stop.time, trip?.delayMin ?? 0) : null,
              status,
              trip: trip
                ? {
                    id: trip.id,
                    status: trip.status,
                    delayMin: trip.delayMin,
                    departed: trip.direction === "to_school" || !!trip.departedAt,
                    stopsAway: Math.max(0, stopIndex - trip.stopIndex),
                    notices: trip.notices.filter((n) => n.toFamilies),
                  }
                : null,
              driver: driver ? { name: driver.name, phone: driver.phone ?? undefined } : null,
              vehicle: vehicle ? { name: vehicle.name, plate: vehicle.plate } : null,
            };
          }),
      );
      return {
        id: child.id,
        name: child.name,
        grade: child.grade,
        hasFace: faces.some((f) => f.studentId === child.id),
        legs: legs.sort((a, b) => a.startTime.localeCompare(b.startTime)),
        absences: absences
          .filter((a) => a.studentId === child.id)
          .sort((a, b) => a.from.localeCompare(b.from))
          .map((a) => ({ id: a.id, from: a.from, to: a.to, direction: a.direction, note: a.note ?? undefined })),
      };
    }),
  );
  return { school: ctx.school.location ?? null, children: result.sort((a, b) => a.name.localeCompare(b.name, "es")) };
});

/** Asistencia de los últimos 30 días de los hijos del acudiente. */
export const activity = parentQuery(noArgs, async (ctx) => {
  ctx.watch("trips");
  const children = await myChildren(ctx);
  if (!children.length) return [];
  const rows = await ctx.db
    .select({ boarding: t.boardings, trip: t.trips })
    .from(t.boardings)
    .innerJoin(t.trips, eq(t.trips.id, t.boardings.tripId))
    .where(and(inArray(t.boardings.studentId, children.map((c) => c.id)), gte(t.boardings.at, ctx.now - 30 * 86400000)));
  const name = new Map(children.map((c) => [c.id, c.name]));
  return rows
    .map(({ boarding: b, trip }) => ({
      id: b.id, studentName: name.get(b.studentId)!, status: b.status, at: b.at,
      date: trip.date, routeName: trip.routeName, direction: trip.direction,
    }))
    .sort((a, b) => b.at - a.at);
});

async function mayReport(ctx: AuthCtx, studentId: string) {
  const allowed = ctx.user.role === "admin" || (ctx.user.role === "parent" && (await isGuardian(ctx.db, ctx.user.id, studentId)));
  if (!allowed) fail("No tienes permiso para esto.", 403);
}

/** Reporta una ausencia. Queda aplicada al instante; la crea un acudiente o el coordinador. */
export const reportAbsence = userMutation(
  z.object({
    studentId: uuid,
    from: z.string(),
    to: z.string(),
    direction: z.enum(["to_school", "from_school", "both"]),
    note: z.string().max(240).optional(),
  }),
  async (ctx, { studentId, from, to, note, direction }) => {
    const student = await owned(ctx, "students", studentId);
    await mayReport(ctx, studentId);
    const today = localNow(ctx.school.timezone, ctx.now).date;
    if (!isDate(from) || !isDate(to) || from > to) fail("Revisa las fechas.");
    if (from < today) fail("La ausencia no puede empezar en una fecha pasada.");
    if (to > addDays(from, 60)) fail("Una ausencia cubre máximo 60 días.");
    const [row] = await ctx.db
      .insert(t.absences)
      .values({ schoolId: student.schoolId, studentId, from, to, direction, note: note ? clean(note, 200) : null, createdBy: ctx.user.id })
      .returning({ id: t.absences.id });
    // Avisar al coordinador y a los conductores de las rutas afectadas.
    const routes = await ctx.db.select().from(t.routes).where(eq(t.routes.schoolId, student.schoolId));
    const drivers = routes
      .filter((r) => (direction === "both" || r.direction === direction) && r.stops.some((s) => s.studentIds.includes(studentId)))
      .map((r) => r.driverId)
      .filter((d): d is string => !!d);
    const recipients = [...(await adminsOf(ctx.db, student.schoolId)), ...drivers].filter((u) => u !== ctx.user.id);
    const when = from === to ? `el ${from}` : `del ${from} al ${to}`;
    const which = { both: "", to_school: " (mañana)", from_school: " (tarde)" }[direction];
    await notify(ctx, student.schoolId, recipients, "Ausencia reportada", `${student.name} no viaja ${when}${which}.`);
    ctx.touch("absences");
    return row.id;
  },
);

/** Cancela una ausencia vigente, salvo que el viaje de hoy que la usa ya haya iniciado. */
export const cancelAbsence = userMutation(z.object({ id: uuid }), async (ctx, { id }) => {
  const absence = await owned(ctx, "absences", id);
  await mayReport(ctx, absence.studentId);
  const today = localNow(ctx.school.timezone, ctx.now).date;
  if (absence.to < today) fail("Esa ausencia ya pasó.");
  if (absence.from <= today) {
    const trips = await ctx.db.select().from(t.trips).where(and(eq(t.trips.schoolId, absence.schoolId), eq(t.trips.date, today)));
    const used = trips.some((x) => covers(absence, today, x.direction) && x.stops.some((s) => s.studentIds.includes(absence.studentId)));
    if (used) fail("El viaje de hoy ya inició. Llama al colegio si hubo un cambio.");
  }
  await ctx.db.delete(t.absences).where(eq(t.absences.id, id));
  ctx.touch("absences");
  return null;
});
