// Pruebas de punta a punta del backend sobre una base en memoria.
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api, internal } from "../convex/_generated/api";
import { sha256 } from "../convex/lib";
import schema from "../convex/schema";

const modules = import.meta.glob("../convex/**/*.ts");
const DATE = "2026-03-11"; // miércoles
const SIX_AM = Date.UTC(2026, 2, 11, 11, 0); // 06:00 en Guayaquil

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(SIX_AM);
});
afterEach(() => vi.useRealTimers());

async function setup() {
  const t = convexTest(schema, modules);
  await t.mutation(internal.seed.demo, {});
  const login = async (email: string) => {
    await t.mutation(internal.seed.session, { email, token: `tok-${email}` });
    return `tok-${email}`;
  };
  return {
    t,
    admin: await login("coordinacion@demo.abordo.app"),
    driver: await login("ramiro@demo.abordo.app"), // rutas Sur
    lucia: await login("lucia@demo.abordo.app"), // Sofía y Mateo, zona sur
    ana: await login("ana@demo.abordo.app"), // Emilia, zona norte
  };
}

const message = async (p: Promise<unknown>) => {
  try {
    await p;
  } catch (e) {
    return e instanceof ConvexError ? (e.data as string) : String(e);
  }
  return "sin error";
};

describe("acceso", () => {
  test("código correcto abre sesión; 5 intentos fallidos lo bloquean", async () => {
    const t = convexTest(schema, modules);
    await t.action(api.auth.registerSchool, {
      schoolName: "Colegio Prueba", name: "Marta", email: "Marta@Prueba.edu", timezone: "America/Bogota",
    });
    const email = "marta@prueba.edu";
    const set = (code: string) =>
      t.run(async (ctx) => {
        const user = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).unique();
        await ctx.db.patch(user!._id, { login: { ...user!.login!, codeHash: await sha256(`${email}:${code}`), attempts: 0 } });
      });
    await set("123456");
    expect(await message(t.action(api.auth.verifyCode, { email, code: "000000" }))).toContain("incorrecto");
    const { token } = await t.action(api.auth.verifyCode, { email, code: "123456" });
    const me = await t.query(api.auth.me, { token });
    expect(me?.user.role).toBe("admin");
    expect(me?.school.name).toBe("Colegio Prueba");
    // El código se consume: no sirve dos veces.
    expect(await message(t.action(api.auth.verifyCode, { email, code: "123456" }))).toContain("incorrecto");

    vi.setSystemTime(SIX_AM + 2 * 60 * 1000);
    await t.action(api.auth.requestCode, { email });
    await set("654321");
    for (let i = 0; i < 5; i++) await message(t.action(api.auth.verifyCode, { email, code: "111111" }));
    expect(await message(t.action(api.auth.verifyCode, { email, code: "654321" }))).toContain("incorrecto");

    await t.mutation(api.auth.signOut, { token });
    expect(await t.query(api.auth.me, { token })).toBeNull();
  });

  test("un correo no registrado no recibe código ni revela nada", async () => {
    const t = convexTest(schema, modules);
    expect(await t.action(api.auth.requestCode, { email: "nadie@x.com" })).toBeNull();
  });
});

describe("permisos y aislamiento entre colegios", () => {
  test("sin sesión o con otro rol no se entra", async () => {
    const { t, lucia, driver } = await setup();
    expect(await message(t.query(api.students.list, { token: "inventado" }))).toContain("sesión");
    expect(await message(t.query(api.students.list, { token: lucia }))).toContain("permiso");
    expect(await message(t.query(api.trips.today, { token: driver, date: DATE }))).toContain("permiso");
  });

  test("un coordinador no toca datos de otro colegio", async () => {
    const { t, admin } = await setup();
    await t.action(api.auth.registerSchool, { schoolName: "Otro Colegio", name: "Eva", email: "eva@otro.edu", timezone: "America/Bogota" });
    await t.mutation(internal.seed.session, { email: "eva@otro.edu", token: "tok-eva" });
    const students = await t.query(api.students.list, { token: admin });
    expect(students).toHaveLength(11);
    expect(await t.query(api.students.list, { token: "tok-eva" })).toHaveLength(0);
    expect(await message(t.mutation(api.students.archive, { token: "tok-eva", id: students[0]._id }))).toContain("No encontrado");
    const routes = await t.query(api.routes.list, { token: admin });
    expect(await message(t.mutation(api.routes.remove, { token: "tok-eva", id: routes[0]._id }))).toContain("No encontrado");
    // Tampoco puede adueñarse del correo de un acudiente de otro colegio.
    expect(
      await message(
        t.mutation(api.students.save, {
          token: "tok-eva", name: "Niño", grade: "1.º", address: "", guardians: [{ name: "L", email: "lucia@demo.abordo.app" }],
        }),
      ),
    ).toContain("otra cuenta");
  });

  test("un acudiente solo ve y gestiona a sus hijos", async () => {
    const { t, admin, lucia, ana } = await setup();
    const home = await t.query(api.family.home, { token: lucia, date: DATE });
    expect(home.children.map((c) => c.name)).toEqual(["Mateo Andrade", "Sofía Andrade"]);
    const emilia = (await t.query(api.students.list, { token: admin })).find((s) => s.name === "Emilia Espinosa")!;
    expect(
      await message(t.mutation(api.family.reportAbsence, { token: lucia, studentId: emilia._id, from: DATE, to: DATE, direction: "both" })),
    ).toContain("permiso");
    const face = [Array.from({ length: 128 }, () => 0.1)];
    expect(await message(t.mutation(api.faces.enroll, { token: lucia, studentId: emilia._id, descriptors: face, consent: true }))).toContain("permiso");
    await t.mutation(api.faces.enroll, { token: ana, studentId: emilia._id, descriptors: face, consent: true });
    expect((await t.query(api.family.home, { token: ana, date: DATE })).children[0].hasFace).toBe(true);
  });
});

describe("viaje hacia el colegio", () => {
  test("de inicio a fin, con ausencia, deshacer y avisos a la familia", async () => {
    const { t, admin, driver, lucia } = await setup();
    const students = await t.query(api.students.list, { token: admin });
    const id = (name: string) => students.find((s) => s.name === name)!._id;

    // Lucía reporta que Mateo no viaja hoy en la mañana.
    await t.mutation(api.family.reportAbsence, { token: lucia, studentId: id("Mateo Andrade"), from: DATE, to: DATE, direction: "to_school" });
    const day = await t.query(api.trips.myDay, { token: driver, date: DATE });
    const am = day.find((r) => r.direction === "to_school")!;
    expect(day).toHaveLength(2);
    expect(am).toMatchObject({ expected: 5, absent: 1, trip: null });

    const tripId = await t.mutation(api.trips.start, { token: driver, routeId: am.routeId });
    expect(await t.mutation(api.trips.start, { token: driver, routeId: am.routeId })).toBe(tripId); // idempotente
    const pm = day.find((r) => r.direction === "from_school")!;
    expect(await message(t.mutation(api.trips.start, { token: driver, routeId: pm.routeId }))).toContain("en curso");
    // Con el viaje iniciado ya no se puede cancelar la ausencia de hoy.
    const absenceId = (await t.query(api.family.home, { token: lucia, date: DATE })).children[0].absences[0]._id;
    expect(await message(t.mutation(api.family.cancelAbsence, { token: lucia, id: absenceId }))).toContain("ya inició");

    let trip = await t.query(api.trips.detail, { token: driver, tripId });
    expect(trip.stopIndex).toBe(0);
    const order = trip.stops.flatMap((s) => s.students);
    expect(order.find((s) => s.name === "Mateo Andrade")!.status).toBe("absent");

    // Marca a todos; un toque equivocado se deshace antes de avisar a la familia.
    const sofia = id("Sofía Andrade");
    await t.mutation(api.trips.mark, { token: driver, tripId, studentId: sofia, status: "no_show", method: "tap" });
    await t.mutation(api.trips.mark, { token: driver, tripId, studentId: sofia, status: "undo", method: "tap" });
    await t.finishAllScheduledFunctions(vi.runAllTimers);
    const notes = async (token: string) => (await t.query(api.notifications.mine, { token })).items.map((n) => n.title);
    expect(await notes(lucia)).toEqual(["El bus ya salió"]);

    vi.setSystemTime(SIX_AM + 45 * 60 * 1000); // 06:45, ya con retraso
    for (const s of order) {
      if (s.status === "absent") continue;
      const status = s.name === "Valentina Benítez" ? "no_show" : "boarded";
      await t.mutation(api.trips.mark, { token: driver, tripId, studentId: s._id, status, method: s._id === sofia ? "face" : "tap" });
    }
    await t.finishAllScheduledFunctions(vi.runAllTimers);
    trip = await t.query(api.trips.detail, { token: driver, tripId });
    expect(trip.stopIndex).toBe(trip.stops.length);
    expect(trip.delayMin).toBeGreaterThan(0);
    expect(trip.counts).toMatchObject({ boarded: 4, no_show: 1, absent: 1, expected: 0 });
    expect(await notes(lucia)).toEqual(["Sofía subió al bus", "El bus ya salió"]);

    const sofiaLeg = (await t.query(api.family.home, { token: lucia, date: DATE })).children[1].legs[0];
    expect(sofiaLeg).toMatchObject({ status: "boarded", trip: { status: "in_progress" } });

    // El coordinador lo ve en vivo.
    const today = await t.query(api.trips.today, { token: admin, date: DATE });
    expect(today.trips).toHaveLength(1);
    expect(today.pending).toHaveLength(3);
    expect(today.absences).toHaveLength(1);

    await t.mutation(api.trips.finish, { token: driver, tripId });
    await t.finishAllScheduledFunctions(vi.runAllTimers);
    trip = await t.query(api.trips.detail, { token: admin, tripId });
    expect(trip.status).toBe("completed");
    expect(trip.counts).toMatchObject({ dropped: 4, no_show: 1, absent: 1 });
    expect((await notes(lucia))[0]).toBe("Sofía llegó al colegio");
    expect(await message(t.mutation(api.trips.mark, { token: driver, tripId, studentId: sofia, status: "undo", method: "tap" }))).toContain("terminó");
    const history = await t.query(api.trips.history, { token: admin, from: DATE, to: DATE });
    expect(history[0].summary).toEqual({ total: 6, dropped: 4, noShow: 1, absent: 1 });
  });

  test("otro conductor no puede operar el viaje ni leer sus rostros", async () => {
    const { t, driver } = await setup();
    await t.mutation(internal.seed.session, { email: "hernan@demo.abordo.app", token: "tok-hernan" });
    const am = (await t.query(api.trips.myDay, { token: driver, date: DATE }))[0];
    const tripId = await t.mutation(api.trips.start, { token: driver, routeId: am.routeId });
    expect(await message(t.mutation(api.trips.finish, { token: "tok-hernan", tripId }))).toContain("no es tuyo");
    expect(await message(t.mutation(api.trips.start, { token: "tok-hernan", routeId: am.routeId }))).toContain("no está asignada");
    expect(await t.query(api.faces.forTrip, { token: "tok-hernan", tripId })).toEqual([]);
  });
});

describe("viaje desde el colegio", () => {
  test("abordaje en el colegio, salida, entrega por parada y cierre", async () => {
    const { t, admin, driver, lucia } = await setup();
    vi.setSystemTime(Date.UTC(2026, 2, 11, 19, 0)); // 14:00 en Guayaquil
    const pm = (await t.query(api.trips.myDay, { token: driver, date: DATE })).find((r) => r.direction === "from_school")!;
    const tripId = await t.mutation(api.trips.start, { token: driver, routeId: pm.routeId });
    let trip = await t.query(api.trips.detail, { token: driver, tripId });
    const all = trip.stops.flatMap((s) => s.students);
    const stays = all.find((s) => s.name === "Daniel Cevallos")!;

    for (const s of all) {
      if (s._id !== stays._id) await t.mutation(api.trips.mark, { token: driver, tripId, studentId: s._id, status: "boarded", method: "tap" });
    }
    expect(await message(t.mutation(api.trips.mark, { token: driver, tripId, studentId: stays._id, status: "dropped", method: "tap" }))).toContain("a bordo");
    await t.mutation(api.trips.depart, { token: driver, tripId });
    await t.finishAllScheduledFunctions(vi.runAllTimers);
    trip = await t.query(api.trips.detail, { token: driver, tripId });
    expect(trip.counts).toMatchObject({ boarded: 5, no_show: 1 });
    // La parada del que no subió se salta sola: la siguiente es la primera con alguien a bordo.
    expect(trip.stopIndex).toBe(trip.stops.findIndex((s) => s.students.some((x) => x.status === "boarded")));
    expect(await message(t.mutation(api.trips.finish, { token: driver, tripId }))).toContain("a bordo");

    // Cerca de la parada siguiente: aviso de llegada, una sola vez.
    const first = trip.stops[trip.stopIndex];
    await t.mutation(api.trips.position, { token: driver, tripId, lat: first.lat + 0.001, lng: first.lng });
    await t.mutation(api.trips.position, { token: driver, tripId, lat: first.lat, lng: first.lng });
    expect(await t.query(api.trips.livePosition, { token: lucia, tripId })).toMatchObject({ lat: first.lat });
    expect(await t.query(api.trips.livePositions, { token: admin })).toHaveLength(1);

    for (const stop of trip.stops) {
      for (const s of stop.students) {
        if (s._id !== stays._id) await t.mutation(api.trips.mark, { token: driver, tripId, studentId: s._id, status: "dropped", method: "tap" });
      }
    }
    await t.mutation(api.trips.finish, { token: driver, tripId });
    await t.finishAllScheduledFunctions(vi.runAllTimers);
    trip = await t.query(api.trips.detail, { token: admin, tripId });
    expect(trip).toMatchObject({ status: "completed", counts: { dropped: 5, no_show: 1 } });
    expect(await t.query(api.trips.livePositions, { token: admin })).toHaveLength(0);

    const near = await t.run((ctx) => ctx.db.query("notifications").collect());
    const guardians = new Set(near.filter((n) => n.title === "El bus está por llegar").map((n) => n.userId));
    expect(near.filter((n) => n.title === "El bus está por llegar")).toHaveLength(guardians.size);
    expect(guardians.size).toBeGreaterThan(0);
    const activity = await t.query(api.family.activity, { token: lucia });
    expect(activity.map((a) => a.status)).toEqual(["dropped", "dropped"]);
  });
});

describe("rutas", () => {
  test("un estudiante no puede estar en dos rutas del mismo sentido", async () => {
    const { t, admin } = await setup();
    const routes = await t.query(api.routes.list, { token: admin });
    const sur = routes.find((r) => r.name === "Sur mañana")!;
    const norte = routes.find((r) => r.name === "Norte mañana")!;
    const { _id, name, direction, days, startTime, vehicleId, driverId, active } = norte;
    const stops = [...norte.stops, { ...sur.stops[0], id: "x" }];
    expect(
      await message(t.mutation(api.routes.save, { token: admin, id: _id, name, direction, days, startTime, vehicleId, driverId, active, stops })),
    ).toContain('ya está en la ruta "Sur mañana"');
  });

  test("archivar a un estudiante lo saca de sus rutas y borra su rostro", async () => {
    const { t, admin, lucia } = await setup();
    const students = await t.query(api.students.list, { token: admin });
    const valentina = students.find((s) => s.name === "Valentina Benítez")!;
    await t.mutation(api.faces.enroll, { token: admin, studentId: valentina._id, descriptors: [Array.from({ length: 128 }, () => 0)], consent: true });
    await t.mutation(api.students.archive, { token: admin, id: valentina._id });
    const routes = await t.query(api.routes.list, { token: admin });
    expect(routes.flatMap((r) => r.stops).some((s) => s.studentIds.includes(valentina._id))).toBe(false);
    expect(await t.run((ctx) => ctx.db.query("faces").collect())).toHaveLength(0);
    // Su acudiente, sin más hijos, pierde la cuenta; Lucía no se ve afectada.
    expect(await t.run((ctx) => ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", "carlos@demo.abordo.app")).unique())).toBeNull();
    expect(await t.query(api.auth.me, { token: lucia })).not.toBeNull();
  });
});
