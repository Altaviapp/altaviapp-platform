// Equipo (coordinadores y conductores), buses y ajustes del colegio.
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { EMAIL_RE } from "../lib/csv";
import { adminMutation, adminQuery, clean, fail, normalizeEmail, owned } from "./lib";

export const list = adminQuery({
  args: {},
  handler: async (ctx) => {
    const schoolId = ctx.school._id;
    const users = await ctx.db
      .query("users")
      .withIndex("by_school_role", (q) => q.eq("schoolId", schoolId))
      .collect();
    const vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_school", (q) => q.eq("schoolId", schoolId))
      .collect();
    return {
      members: users
        .filter((u) => u.role !== "parent")
        .sort((a, b) => a.name.localeCompare(b.name, "es"))
        .map((u) => ({
          _id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role,
          active: u.active, joined: !!u.verifiedAt,
        })),
      vehicles: vehicles.sort((a, b) => a.name.localeCompare(b.name, "es", { numeric: true })),
    };
  },
});

export const saveMember = adminMutation({
  args: {
    id: v.optional(v.id("users")),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("driver")),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const schoolId = ctx.school._id;
    const email = normalizeEmail(args.email);
    const name = clean(args.name, 80);
    if (name.length < 2) fail("Escribe el nombre.");
    if (!EMAIL_RE.test(email)) fail("Escribe un correo válido.");
    const taken = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).unique();
    if (taken && taken._id !== args.id) fail("Ese correo ya está registrado.");
    const fields = { name, email, phone: args.phone ? clean(args.phone, 30) : undefined, role: args.role, active: args.active };
    if (!args.id) {
      const id = await ctx.db.insert("users", { ...fields, schoolId });
      await ctx.scheduler.runAfter(0, internal.email.welcome, {
        to: email, name, school: ctx.school.name, role: args.role,
      });
      return id;
    }
    const member = await owned(ctx, args.id, schoolId);
    if (member.role === "parent") fail("Los acudientes se editan desde el estudiante.");
    if (member._id === ctx.user._id && (!args.active || args.role !== "admin")) {
      fail("No puedes quitarte tu propio acceso de coordinador.");
    }
    await ctx.db.patch(member._id, fields);
    const leavesDriving = member.role === "driver" && (!args.active || args.role !== "driver");
    if (leavesDriving) {
      const routes = await ctx.db.query("routes").withIndex("by_driver", (q) => q.eq("driverId", member._id)).collect();
      for (const route of routes) await ctx.db.patch(route._id, { driverId: undefined });
    }
    if (!args.active || member.email !== email) {
      const sessions = await ctx.db.query("sessions").withIndex("by_user", (q) => q.eq("userId", member._id)).collect();
      for (const s of sessions) await ctx.db.delete(s._id);
    }
    return member._id;
  },
});

export const saveVehicle = adminMutation({
  args: {
    id: v.optional(v.id("vehicles")),
    name: v.string(),
    plate: v.string(),
    capacity: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const name = clean(args.name, 40);
    if (!name) fail("Ponle un nombre o número al bus.");
    if (!Number.isInteger(args.capacity) || args.capacity < 1 || args.capacity > 100) {
      fail("La capacidad debe estar entre 1 y 100.");
    }
    const fields = { name, plate: clean(args.plate, 12).toUpperCase(), capacity: args.capacity, active: args.active };
    if (!args.id) return ctx.db.insert("vehicles", { ...fields, schoolId: ctx.school._id });
    await owned(ctx, args.id, ctx.school._id);
    await ctx.db.patch(args.id, fields);
    if (!args.active) {
      const routes = await ctx.db.query("routes").withIndex("by_school", (q) => q.eq("schoolId", ctx.school._id)).collect();
      for (const r of routes) if (r.vehicleId === args.id) await ctx.db.patch(r._id, { vehicleId: undefined });
    }
    return args.id;
  },
});

export const saveSchool = adminMutation({
  args: {
    name: v.string(),
    timezone: v.string(),
    location: v.optional(v.object({ lat: v.number(), lng: v.number(), address: v.string() })),
    grades: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const name = clean(args.name, 80);
    if (name.length < 3) fail("Escribe el nombre del colegio.");
    try {
      new Intl.DateTimeFormat("es", { timeZone: args.timezone });
    } catch {
      fail("Zona horaria inválida.");
    }
    const grades = [...new Set(args.grades.map((g) => clean(g, 30)).filter(Boolean))];
    if (!grades.length) fail("Deja al menos un grado.");
    await ctx.db.patch(ctx.school._id, { name, timezone: args.timezone, location: args.location, grades });
    return null;
  },
});
