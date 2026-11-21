// Colegio de demostración en Bogotá. Lo usan las pruebas y `pnpm seed`.
import { eq } from "drizzle-orm";
import { estimateTimes, orderStops } from "@/lib/geo";
import { DEFAULT_GRADES, TRIAL_DAYS } from "@/server/auth";
import type { Db } from "./client";
import * as t from "./schema";

const SCHOOL = { lat: 4.7005, lng: -74.0405, address: "Calle 127 # 15-20, Bogotá" };
const FAMILIES: [string, string, string, number, number, string[]][] = [
  ["Lucía Andrade", "lucia@demo.abordo.app", "Cra 11 # 93-45", 4.6765, -74.0462, ["Sofía Andrade|4.º", "Mateo Andrade|2.º"]],
  ["Carlos Benítez", "carlos@demo.abordo.app", "Calle 85 # 12-30", 4.6689, -74.0521, ["Valentina Benítez|6.º"]],
  ["María Cevallos", "maria@demo.abordo.app", "Cra 7 # 108-22", 4.6892, -74.0341, ["Daniel Cevallos|7.º"]],
  ["Jorge Dávila", "jorge@demo.abordo.app", "Calle 100 # 17-55", 4.6841, -74.0513, ["Camila Dávila|1.º", "Nicolás Dávila|5.º"]],
  ["Ana Espinosa", "ana@demo.abordo.app", "Cra 9 # 140-10", 4.7189, -74.0312, ["Emilia Espinosa|3.º"]],
  ["Pedro Flores", "pedro@demo.abordo.app", "Calle 153 # 18-40", 4.7331, -74.0487, ["Martín Flores|8.º"]],
  ["Paula Granda", "paula@demo.abordo.app", "Cra 15 # 146-33", 4.7254, -74.0421, ["Isabella Granda|4.º"]],
  ["Luis Herrera", "luis@demo.abordo.app", "Calle 134 # 13-08", 4.7121, -74.0389, ["Sebastián Herrera|9.º", "Julieta Herrera|6.º"]],
];

/** Crea el colegio de demostración completo. No hace nada si ya existe. */
export async function seedDemo(db: Db, now = Date.now()): Promise<string> {
  const exists = await db.select({ id: t.users.id }).from(t.users).where(eq(t.users.email, "coordinacion@demo.abordo.app"));
  if (exists.length) return "El colegio de demostración ya existe.";
  const [school] = await db
    .insert(t.schools)
    .values({ name: "Colegio Los Arrayanes", timezone: "America/Bogota", location: SCHOOL, grades: DEFAULT_GRADES })
    .returning();
  const schoolId = school.id;
  await db.insert(t.subscriptions).values({
    schoolId, status: "trial", pricePerStudent: 6000, trialEndsAt: now + TRIAL_DAYS * 86400000, billingEmail: "coordinacion@demo.abordo.app",
  });
  const user = async (name: string, email: string, role: t.Role, phone?: string) =>
    (await db.insert(t.users).values({ schoolId, name, email, role, phone }).returning({ id: t.users.id }))[0].id;
  await user("Gabriela Mora", "coordinacion@demo.abordo.app", "admin");
  const drivers = [
    await user("Ramiro Quintero", "ramiro@demo.abordo.app", "driver", "+57 310 111 2233"),
    await user("Hernán Tovar", "hernan@demo.abordo.app", "driver", "+57 311 444 5566"),
  ];
  const vehicles = (
    await db
      .insert(t.vehicles)
      .values([
        { schoolId, name: "Bus 1", plate: "WMK-123", capacity: 24 },
        { schoolId, name: "Bus 2", plate: "TZR-456", capacity: 18 },
      ])
      .returning({ id: t.vehicles.id })
  ).map((v) => v.id);

  const homes: { studentIds: string[]; name: string; lat: number; lng: number }[] = [];
  for (const [parent, email, address, lat, lng, kids] of FAMILIES) {
    const parentId = await user(parent, email, "parent", "+57 300 000 0000");
    const studentIds: string[] = [];
    for (const kid of kids) {
      const [name, grade] = kid.split("|");
      const [student] = await db.insert(t.students).values({ schoolId, name, grade, address, home: { lat, lng } }).returning({ id: t.students.id });
      await db.insert(t.guardians).values({ schoolId, studentId: student.id, userId: parentId });
      studentIds.push(student.id);
    }
    homes.push({ studentIds, name: address, lat, lng });
  }
  // Dos zonas (sur y norte del colegio), cada una con ruta de mañana y de tarde.
  const zones = [homes.filter((h) => h.lat < SCHOOL.lat), homes.filter((h) => h.lat >= SCHOOL.lat)];
  for (const [i, zone] of zones.entries()) {
    for (const direction of ["to_school", "from_school"] as const) {
      const startTime = direction === "to_school" ? "06:00" : "14:30";
      const ordered = orderStops(zone, SCHOOL, direction);
      const times = estimateTimes(ordered, startTime, SCHOOL, direction);
      await db.insert(t.routes).values({
        schoolId,
        name: `${i === 0 ? "Sur" : "Norte"} ${direction === "to_school" ? "mañana" : "tarde"}`,
        direction,
        days: [0, 1, 2, 3, 4, 5, 6], // todos los días, para poder probar la demo cualquier día
        startTime,
        vehicleId: vehicles[i],
        driverId: drivers[i],
        stops: ordered.map((h, n) => ({ id: `s${n + 1}`, name: h.name, lat: h.lat, lng: h.lng, time: times[n], studentIds: h.studentIds })),
      });
    }
  }
  return "Listo: coordinacion@demo.abordo.app, ramiro@demo.abordo.app, lucia@demo.abordo.app";
}
