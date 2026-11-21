// Datos de demostración y utilidades de desarrollo. Solo funciones internas:
// se ejecutan con `npx convex run`, nunca desde un cliente.
import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { estimateTimes, orderStops } from "../lib/geo";
import { DEFAULT_GRADES } from "./auth";
import { sha256 } from "./lib";

const SCHOOL = { lat: -0.1807, lng: -78.4678, address: "Av. República 500, Quito" };
const FAMILIES: [string, string, string, number, number, string[]][] = [
  ["Lucía Andrade", "lucia@demo.abordo.app", "González Suárez N27", -0.1985, -78.4792, ["Sofía Andrade|4.º", "Mateo Andrade|2.º"]],
  ["Carlos Benítez", "carlos@demo.abordo.app", "La Coruña E12", -0.2031, -78.4836, ["Valentina Benítez|6.º"]],
  ["María Cevallos", "maria@demo.abordo.app", "Av. 6 de Diciembre N34", -0.1902, -78.4801, ["Daniel Cevallos|7.º"]],
  ["Jorge Dávila", "jorge@demo.abordo.app", "Whymper N29", -0.1948, -78.4853, ["Camila Dávila|1.º", "Nicolás Dávila|5.º"]],
  ["Ana Espinosa", "ana@demo.abordo.app", "Eloy Alfaro N41", -0.1689, -78.4712, ["Emilia Espinosa|3.º"]],
  ["Pedro Flores", "pedro@demo.abordo.app", "El Inca E5", -0.1553, -78.4762, ["Martín Flores|8.º"]],
  ["Paula Granda", "paula@demo.abordo.app", "De los Shyris N44", -0.1642, -78.4789, ["Isabella Granda|4.º"]],
  ["Luis Herrera", "luis@demo.abordo.app", "Gaspar de Villarroel E10", -0.1711, -78.4755, ["Sebastián Herrera|9.º", "Julieta Herrera|6.º"]],
];

/** Crea un colegio de demostración completo. Devuelve los correos para entrar. */
export const demo = internalMutation({
  args: {},
  handler: async (ctx) => {
    const exists = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", "coordinacion@demo.abordo.app")).unique();
    if (exists) return "El colegio de demostración ya existe.";
    const schoolId = await ctx.db.insert("schools", {
      name: "Colegio Los Arrayanes", timezone: "America/Guayaquil", location: SCHOOL, grades: DEFAULT_GRADES,
    });
    const user = (name: string, email: string, role: "admin" | "driver" | "parent", phone?: string) =>
      ctx.db.insert("users", { schoolId, name, email, role, phone, active: true });
    await user("Gabriela Mora", "coordinacion@demo.abordo.app", "admin");
    const drivers = [
      await user("Ramiro Quishpe", "ramiro@demo.abordo.app", "driver", "+593 99 111 2233"),
      await user("Hernán Tipán", "hernan@demo.abordo.app", "driver", "+593 99 444 5566"),
    ];
    const vehicles = [
      await ctx.db.insert("vehicles", { schoolId, name: "Bus 1", plate: "PBA-1234", capacity: 24, active: true }),
      await ctx.db.insert("vehicles", { schoolId, name: "Bus 2", plate: "PCD-5678", capacity: 18, active: true }),
    ];
    const homes: { studentIds: string[]; name: string; lat: number; lng: number }[] = [];
    for (const [parent, email, address, lat, lng, kids] of FAMILIES) {
      const parentId = await user(parent, email, "parent", "+593 98 000 0000");
      const studentIds = [];
      for (const kid of kids) {
        const [name, grade] = kid.split("|");
        const studentId = await ctx.db.insert("students", { schoolId, name, grade, address, home: { lat, lng }, active: true });
        await ctx.db.insert("guardians", { schoolId, studentId, userId: parentId });
        studentIds.push(studentId);
      }
      homes.push({ studentIds, name: address, lat, lng });
    }
    // Dos zonas (sur y norte), cada una con ruta de mañana y de tarde.
    const zones = [homes.filter((h) => h.lat < SCHOOL.lat), homes.filter((h) => h.lat >= SCHOOL.lat)];
    for (const [i, zone] of zones.entries()) {
      for (const direction of ["to_school", "from_school"] as const) {
        const startTime = direction === "to_school" ? "06:30" : "14:00";
        const ordered = orderStops(zone, SCHOOL, direction);
        const times = estimateTimes(ordered, startTime, SCHOOL, direction);
        await ctx.db.insert("routes", {
          schoolId,
          name: `${i === 0 ? "Sur" : "Norte"} ${direction === "to_school" ? "mañana" : "tarde"}`,
          direction,
          days: [1, 2, 3, 4, 5],
          startTime,
          vehicleId: vehicles[i],
          driverId: drivers[i],
          active: true,
          stops: ordered.map((h, n) => ({
            id: `s${n + 1}`, name: h.name, lat: h.lat, lng: h.lng, time: times[n],
            studentIds: h.studentIds as never,
          })),
        });
      }
    }
    return "Listo: coordinacion@demo.abordo.app, ramiro@demo.abordo.app, lucia@demo.abordo.app";
  },
});

/** Abre una sesión para un correo sin pasar por el código. Solo para desarrollo local. */
export const session = internalMutation({
  args: { email: v.string(), token: v.string() },
  handler: async (ctx, { email, token }) => {
    const user = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).unique();
    if (!user) throw new Error("No existe ese usuario");
    await ctx.db.insert("sessions", {
      userId: user._id, tokenHash: await sha256(token), expiresAt: Date.now() + 86400000,
    });
    return user.role;
  },
});
