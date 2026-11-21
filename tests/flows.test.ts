// Pruebas de punta a punta del backend sobre PostgreSQL en memoria, con seguridad por fila activa.
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, test } from "vitest";
import * as t from "@/db/schema";
import { sha256, unseal } from "@/server/crypto";
import { DATE, SIX_AM, createApp, message } from "./harness";

type App = Awaited<ReturnType<typeof createApp>>;
let app: App;
let admin: string, driver: string, lucia: string, ana: string;

beforeEach(async () => {
  app = await createApp();
  await app.seed();
  admin = await app.login("coordinacion@demo.abordo.app");
  driver = await app.login("ramiro@demo.abordo.app"); // rutas Sur
  lucia = await app.login("lucia@demo.abordo.app"); // Sofía y Mateo, zona sur
  ana = await app.login("ana@demo.abordo.app"); // Emilia, zona norte
});

const notes = async (who: string) => (await app.call("notifications.mine", {}, who)).items.map((n) => n.title);

describe("acceso", () => {
  test("código correcto abre sesión; el intento fallido queda contado; 5 fallos bloquean", async () => {
    await app.call("auth.registerSchool", { schoolName: "Colegio Prueba", name: "Marta", email: "Marta@Prueba.edu", timezone: "America/Bogota" });
    const email = "marta@prueba.edu";
    const setCode = (code: string) =>
      app.system(async (tx) => {
        const [user] = await tx.select().from(t.users).where(eq(t.users.email, email));
        await tx.update(t.users).set({ login: { ...user.login!, codeHash: sha256(`${email}:${code}`), attempts: 0 } }).where(eq(t.users.id, user.id));
      });
    const attempts = () => app.system(async (tx) => (await tx.select().from(t.users).where(eq(t.users.email, email)))[0].login?.attempts);

    await setCode("123456");
    expect(await message(app.call("auth.verifyCode", { email, code: "000000" }, email))).toContain("incorrecto");
    expect(await attempts()).toBe(1); // el fallo se confirmó aunque la llamada respondió con error
    expect(await app.call("auth.verifyCode", { email, code: "123456" }, email)).toEqual({ role: "admin" });
    const me = await app.call("auth.me", {}, email);
    expect(me).toMatchObject({ user: { role: "admin" }, school: { name: "Colegio Prueba" }, subscription: { status: "trial" } });
    // El código se consume: no sirve dos veces.
    expect(await message(app.call("auth.verifyCode", { email, code: "123456" }, email))).toContain("incorrecto");

    app.clock.now += 2 * 60 * 1000;
    await app.call("auth.requestCode", { email });
    await setCode("654321");
    for (let i = 0; i < 5; i++) await message(app.call("auth.verifyCode", { email, code: "111111" }, "otro"));
    expect(await message(app.call("auth.verifyCode", { email, code: "654321" }, "otro"))).toContain("incorrecto");

    await app.call("auth.signOut", {}, email);
    expect(await app.call("auth.me", {}, email)).toBeNull();
  });

  test("un correo no registrado no recibe código ni revela nada; hay límite por conexión", async () => {
    expect(await app.call("auth.requestCode", { email: "nadie@x.com" })).toBeNull();
    for (let i = 0; i < 20; i++) await app.call("auth.requestCode", { email: `n${i}@x.com` }, undefined, "9.9.9.9");
    expect(await message(app.call("auth.requestCode", { email: "otro@x.com" }, undefined, "9.9.9.9"))).toContain("Demasiados");
    expect(await app.call("auth.requestCode", { email: "otro@x.com" }, undefined, "8.8.8.8")).toBeNull();
  });
});

describe("permisos y aislamiento entre colegios", () => {
  test("sin sesión o con otro rol no se entra", async () => {
    expect(await message(app.call("students.list", {}, "inventado"))).toContain("sesión");
    expect(await message(app.call("students.list", {}, lucia))).toContain("permiso");
    expect(await message(app.call("trips.today", { date: DATE }, driver))).toContain("permiso");
    expect(await message(app.call("owner.schools", {}, admin))).toContain("permiso");
  });

  test("un coordinador no toca datos de otro colegio", async () => {
    await app.call("auth.registerSchool", { schoolName: "Otro Colegio", name: "Eva", email: "eva@otro.edu", timezone: "America/Bogota" });
    const eva = await app.login("eva@otro.edu");
    const students = await app.call("students.list", {}, admin);
    expect(students).toHaveLength(11);
    expect(await app.call("students.list", {}, eva)).toHaveLength(0);
    expect(await message(app.call("students.archive", { id: students[0].id }, eva))).toContain("No encontrado");
    const routes = await app.call("routes.list", {}, admin);
    expect(await message(app.call("routes.remove", { id: routes[0].id }, eva))).toContain("No encontrado");
    // Tampoco puede adueñarse del correo de un acudiente de otro colegio.
    expect(
      await message(app.call("students.save", { name: "Niño", grade: "1.º", address: "", guardians: [{ name: "L", email: "lucia@demo.abordo.app" }] }, eva)),
    ).toContain("otra cuenta");
  });

  test("la base misma oculta las filas de otro colegio (seguridad por fila)", async () => {
    await app.call("auth.registerSchool", { schoolName: "Otro Colegio", name: "Eva", email: "eva@otro.edu", timezone: "America/Bogota" });
    const [other] = await app.system((tx) => tx.select().from(t.schools).where(eq(t.schools.name, "Otro Colegio")));
    const { scoped } = await import("@/db/client");
    // Consultas SIN filtro por colegio: aun así solo aparecen las filas del alcance fijado.
    const inOther = await scoped(other.id, async (tx) => ({
      students: (await tx.select().from(t.students)).length,
      routes: (await tx.select().from(t.routes)).length,
      users: (await tx.select().from(t.users)).length,
      schools: (await tx.select().from(t.schools)).length,
    }), app.db);
    expect(inOther).toEqual({ students: 0, routes: 0, users: 1, schools: 1 });
    // Sin alcance fijado no se ve nada, y no se puede escribir en otro colegio.
    expect((await app.db.select().from(t.students)).length).toBe(0);
    const [demo] = await app.system((tx) => tx.select().from(t.schools).where(eq(t.schools.name, "Colegio Los Arrayanes")));
    await expect(
      scoped(other.id, (tx) => tx.insert(t.students).values({ schoolId: demo.id, name: "Intruso", grade: "1.º" }), app.db),
    ).rejects.toThrow();
  });

  test("un acudiente solo ve y gestiona a sus hijos; el rostro se guarda cifrado", async () => {
    const home = await app.call("family.home", { date: DATE }, lucia);
    expect(home.children.map((c) => c.name)).toEqual(["Mateo Andrade", "Sofía Andrade"]);
    expect(JSON.stringify(home)).not.toContain("Calle 85"); // domicilio de otra familia de la misma ruta
    const emilia = (await app.call("students.list", {}, admin)).find((s) => s.name === "Emilia Espinosa")!;
    expect(await message(app.call("family.reportAbsence", { studentId: emilia.id, from: DATE, to: DATE, direction: "both" }, lucia))).toContain("permiso");
    const face = [Array.from({ length: 128 }, (_, i) => i / 1000)];
    expect(await message(app.call("faces.enroll", { studentId: emilia.id, descriptors: face, consent: true }, lucia))).toContain("permiso");
    await app.call("faces.enroll", { studentId: emilia.id, descriptors: face, consent: true }, ana);
    expect((await app.call("family.home", { date: DATE }, ana)).children[0].hasFace).toBe(true);
    const [stored] = await app.system((tx) => tx.select().from(t.faces));
    expect(stored.cipher).not.toContain("0.001");
    expect(unseal<number[][]>(stored.cipher)[0][1]).toBe(0.001);
    expect(stored.consentSource).toBe("guardian");
  });
});

describe("viaje hacia el colegio", () => {
  test("de inicio a fin, con ausencia, deshacer y avisos a la familia", async () => {
    const students = await app.call("students.list", {}, admin);
    const id = (name: string) => students.find((s) => s.name === name)!.id;

    // Lucía reporta que Mateo no viaja hoy en la mañana.
    await app.call("family.reportAbsence", { studentId: id("Mateo Andrade"), from: DATE, to: DATE, direction: "to_school" }, lucia);
    const day = await app.call("trips.myDay", { date: DATE }, driver);
    const am = day.find((r) => r.direction === "to_school")!;
    expect(day).toHaveLength(2);
    expect(am).toMatchObject({ expected: 5, absent: 1, trip: null });

    const tripId = await app.call("trips.start", { routeId: am.routeId }, driver);
    expect(await app.call("trips.start", { routeId: am.routeId }, driver)).toBe(tripId); // idempotente
    const pm = day.find((r) => r.direction === "from_school")!;
    expect(await message(app.call("trips.start", { routeId: pm.routeId }, driver))).toContain("en curso");
    // Con el viaje iniciado ya no se puede cancelar la ausencia de hoy.
    const absenceId = (await app.call("family.home", { date: DATE }, lucia)).children[0].absences[0].id;
    expect(await message(app.call("family.cancelAbsence", { id: absenceId }, lucia))).toContain("ya inició");

    let trip = await app.call("trips.detail", { tripId }, driver);
    expect(trip.stopIndex).toBe(0);
    const order = trip.stops.flatMap((s) => s.students);
    expect(order.find((s) => s.name === "Mateo Andrade")!.status).toBe("absent");

    // Un toque equivocado se deshace antes de que salga el aviso a la familia.
    const sofia = id("Sofía Andrade");
    await app.call("trips.mark", { tripId, studentId: sofia, status: "no_show", method: "tap" }, driver);
    await app.call("trips.mark", { tripId, studentId: sofia, status: "undo", method: "tap" }, driver);
    await app.jobs();
    expect(await notes(lucia)).toEqual(["El bus ya salió"]);

    app.clock.now = SIX_AM + 45 * 60 * 1000; // 06:45, ya con retraso
    for (const s of order) {
      if (s.status === "absent") continue;
      const status = s.name === "Valentina Benítez" ? "no_show" : "boarded";
      await app.call("trips.mark", { tripId, studentId: s.id, status, method: s.id === sofia ? "face" : "tap" }, driver);
    }
    await app.jobs();
    trip = await app.call("trips.detail", { tripId }, driver);
    expect(trip.stopIndex).toBe(trip.stops.length);
    expect(trip.delayMin).toBeGreaterThan(0);
    expect(trip.counts).toMatchObject({ boarded: 4, no_show: 1, absent: 1, expected: 0 });
    expect(await notes(lucia)).toEqual(["Sofía subió al bus", "El bus ya salió"]);

    const sofiaLeg = (await app.call("family.home", { date: DATE }, lucia)).children[1].legs[0];
    expect(sofiaLeg).toMatchObject({ status: "boarded", trip: { status: "in_progress" } });

    // El coordinador lo ve en vivo.
    const today = await app.call("trips.today", { date: DATE }, admin);
    expect(today.trips).toHaveLength(1);
    expect(today.pending).toHaveLength(3);
    expect(today.absences).toHaveLength(1);

    app.clock.now += 60_000;
    await app.call("trips.finish", { tripId }, driver);
    await app.jobs();
    trip = await app.call("trips.detail", { tripId }, admin);
    expect(trip.status).toBe("completed");
    expect(trip.counts).toMatchObject({ dropped: 4, no_show: 1, absent: 1 });
    expect((await notes(lucia))[0]).toBe("Sofía llegó al colegio");
    expect(await message(app.call("trips.mark", { tripId, studentId: sofia, status: "undo", method: "tap" }, driver))).toContain("terminó");
    const history = await app.call("trips.history", { from: DATE, to: DATE }, admin);
    expect(history.trips[0].summary).toEqual({ total: 6, dropped: 4, noShow: 1, absent: 1 });
    // Quedó medido el error de la hora estimada contra la llegada real.
    expect(history.etaError!.stops).toBeGreaterThan(0);
  });

  test("otro conductor no puede operar el viaje ni leer sus rostros", async () => {
    const hernan = await app.login("hernan@demo.abordo.app");
    const am = (await app.call("trips.myDay", { date: DATE }, driver))[0];
    const tripId = await app.call("trips.start", { routeId: am.routeId }, driver);
    expect(await message(app.call("trips.finish", { tripId }, hernan))).toContain("no es tuyo");
    expect(await message(app.call("trips.start", { routeId: am.routeId }, hernan))).toContain("no está asignada");
    expect(await app.call("faces.forTrip", { tripId }, hernan)).toEqual([]);
  });

  test("la hora estimada aprende de las llegadas reales de viajes anteriores", async () => {
    const am = (await app.call("trips.myDay", { date: DATE }, driver)).find((r) => r.direction === "to_school")!;
    const planned = (await app.call("routes.list", {}, admin)).find((r) => r.id === am.routeId)!.stops[0].time;
    // Tres días seguidos el bus llega 12 minutos tarde a la primera parada.
    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      app.clock.now = SIX_AM + dayOffset * 86400000 + 12 * 60000;
      const tripId = await app.call("trips.start", { routeId: am.routeId }, driver);
      const trip = await app.call("trips.detail", { tripId }, driver);
      for (const s of trip.stops[0].students) await app.call("trips.mark", { tripId, studentId: s.id, status: "boarded", method: "tap" }, driver);
      await app.call("trips.finish", { tripId }, driver);
    }
    app.clock.now = SIX_AM + 3 * 86400000;
    const tripId = await app.call("trips.start", { routeId: am.routeId }, driver);
    const trip = await app.call("trips.detail", { tripId }, driver);
    expect(planned).toBe("06:00");
    expect(trip.stops[0].time).toBe("06:00"); // la hora prevista se conserva
    expect(trip.stops[0].eta).toBe("06:12"); // la estimada ya incluye el retraso habitual
  });
});

describe("viaje desde el colegio", () => {
  test("abordaje en el colegio, salida, entrega por parada y cierre", async () => {
    app.clock.now = Date.UTC(2026, 2, 11, 19, 30); // 14:30 en Bogotá
    const pm = (await app.call("trips.myDay", { date: DATE }, driver)).find((r) => r.direction === "from_school")!;
    const tripId = await app.call("trips.start", { routeId: pm.routeId }, driver);
    let trip = await app.call("trips.detail", { tripId }, driver);
    const all = trip.stops.flatMap((s) => s.students);
    const stays = all.find((s) => s.name === "Daniel Cevallos")!;

    for (const s of all) {
      if (s.id !== stays.id) await app.call("trips.mark", { tripId, studentId: s.id, status: "boarded", method: "tap" }, driver);
    }
    expect(await message(app.call("trips.mark", { tripId, studentId: stays.id, status: "dropped", method: "tap" }, driver))).toContain("a bordo");
    await app.call("trips.depart", { tripId }, driver);
    await app.jobs();
    trip = await app.call("trips.detail", { tripId }, driver);
    expect(trip.counts).toMatchObject({ boarded: 5, no_show: 1 });
    // La parada del que no subió se salta sola: la siguiente es la primera con alguien a bordo.
    expect(trip.stopIndex).toBe(trip.stops.findIndex((s) => s.students.some((x) => x.status === "boarded")));
    expect(await message(app.call("trips.finish", { tripId }, driver))).toContain("a bordo");

    // Cerca de la parada siguiente: aviso de llegada, una sola vez.
    const first = trip.stops[trip.stopIndex];
    await app.call("trips.position", { tripId, lat: first.lat + 0.001, lng: first.lng }, driver);
    await app.call("trips.position", { tripId, lat: first.lat, lng: first.lng }, driver);
    const parentOfFirst = first.students.some((s) => s.name.includes("Andrade")) ? lucia : undefined;
    if (parentOfFirst) expect(await app.call("trips.livePosition", { tripId }, parentOfFirst)).toMatchObject({ lat: first.lat });
    expect(await message(app.call("trips.livePosition", { tripId }, ana))).toContain("permiso"); // su hija va en otra ruta
    expect(await app.call("trips.livePositions", {}, admin)).toHaveLength(1);

    for (const stop of trip.stops) {
      for (const s of stop.students) {
        if (s.id !== stays.id) await app.call("trips.mark", { tripId, studentId: s.id, status: "dropped", method: "tap" }, driver);
      }
    }
    await app.call("trips.finish", { tripId }, driver);
    await app.jobs();
    trip = await app.call("trips.detail", { tripId }, admin);
    expect(trip).toMatchObject({ status: "completed", counts: { dropped: 5, no_show: 1 } });
    expect(await app.call("trips.livePositions", {}, admin)).toHaveLength(0);

    const near = (await app.system((tx) => tx.select().from(t.notifications))).filter((n) => n.title === "El bus está por llegar");
    expect(near.length).toBeGreaterThan(0);
    expect(new Set(near.map((n) => n.userId)).size).toBe(near.length);
    const activity = await app.call("family.activity", {}, lucia);
    expect(activity.map((a) => a.status)).toEqual(["dropped", "dropped"]);
  });
});

describe("rutas", () => {
  test("un estudiante no puede estar en dos rutas del mismo sentido", async () => {
    const routes = await app.call("routes.list", {}, admin);
    const sur = routes.find((r) => r.name === "Sur mañana")!;
    const norte = routes.find((r) => r.name === "Norte mañana")!;
    const { id, name, direction, days, startTime, vehicleId, driverId, active } = norte;
    const stops = [...norte.stops, { ...sur.stops[0], id: "x" }];
    expect(await message(app.call("routes.save", { id, name, direction, days, startTime, vehicleId, driverId, active, stops }, admin))).toContain(
      'ya está en la ruta "Sur mañana"',
    );
  });

  test("sin motor de rutas, el plan usa el cálculo por línea recta", async () => {
    const sur = (await app.call("routes.list", {}, admin)).find((r) => r.name === "Sur mañana")!;
    const plan = await app.call("routes.plan", { direction: "to_school", startTime: "06:00", reorder: true, stops: [...sur.stops].reverse() }, admin);
    expect(plan.byStreet).toBe(false);
    expect(plan.order).toEqual(sur.stops.map((s) => s.id));
    expect(plan.times[0]).toBe("06:00");
  });

  test("archivar a un estudiante lo saca de sus rutas y borra su rostro", async () => {
    const students = await app.call("students.list", {}, admin);
    const valentina = students.find((s) => s.name === "Valentina Benítez")!;
    await app.call("faces.enroll", { studentId: valentina.id, descriptors: [Array.from({ length: 128 }, () => 0)], consent: true }, admin);
    await app.call("students.archive", { id: valentina.id }, admin);
    const routes = await app.call("routes.list", {}, admin);
    expect(routes.flatMap((r) => r.stops).some((s) => s.studentIds.includes(valentina.id))).toBe(false);
    expect(await app.system((tx) => tx.select().from(t.faces))).toHaveLength(0);
    // Su acudiente, sin más hijos, pierde la cuenta; Lucía no se ve afectada.
    expect(await app.system((tx) => tx.select().from(t.users).where(eq(t.users.email, "carlos@demo.abordo.app")))).toHaveLength(0);
    expect(await app.call("auth.me", {}, lucia)).not.toBeNull();
    // Quedó rastro en la bitácora.
    const audit = await app.system((tx) => tx.select().from(t.auditLog));
    expect(audit.map((a) => a.action)).toContain("rostro.registrar");
  });
});
