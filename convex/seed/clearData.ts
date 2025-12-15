/**
 * Clear All Data Script
 *
 * Deletes ALL data from the database in the correct order to respect foreign keys.
 * Use with caution - this will wipe the entire database!
 *
 * Run with: npx convex run seed/clearData:clearAllData
 */

import { action, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";

// Internal mutation to delete all data
export const _deleteAllData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const counts: Record<string, number> = {};

    // 1. Delete sessions first (references users)
    const sessions = await ctx.db.query("sessions").collect();
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }
    counts.sessions = sessions.length;
    console.log(`🧹 Deleted ${sessions.length} sessions`);

    // 2. Delete tripVehicleChanges (references trips, vehicles, drivers)
    const tripVehicleChanges = await ctx.db.query("tripVehicleChanges").collect();
    for (const change of tripVehicleChanges) {
      await ctx.db.delete(change._id);
    }
    counts.tripVehicleChanges = tripVehicleChanges.length;
    console.log(`🧹 Deleted ${tripVehicleChanges.length} tripVehicleChanges`);

    // 3. Delete tripStudents (references trips, students)
    const tripStudents = await ctx.db.query("tripStudents").collect();
    for (const ts of tripStudents) {
      await ctx.db.delete(ts._id);
    }
    counts.tripStudents = tripStudents.length;
    console.log(`🧹 Deleted ${tripStudents.length} tripStudents`);

    // 4. Delete studentCheckins (references trips, students)
    const studentCheckins = await ctx.db.query("studentCheckins").collect();
    for (const checkin of studentCheckins) {
      await ctx.db.delete(checkin._id);
    }
    counts.studentCheckins = studentCheckins.length;
    console.log(`🧹 Deleted ${studentCheckins.length} studentCheckins`);

    // 5. Delete gpsTracking (references trips)
    const gpsTracking = await ctx.db.query("gpsTracking").collect();
    for (const loc of gpsTracking) {
      await ctx.db.delete(loc._id);
    }
    counts.gpsTracking = gpsTracking.length;
    console.log(`🧹 Deleted ${gpsTracking.length} gpsTracking`);

    // 6. Delete trips (references routes, vehicles, drivers, monitors)
    const trips = await ctx.db.query("trips").collect();
    for (const trip of trips) {
      await ctx.db.delete(trip._id);
    }
    counts.trips = trips.length;
    console.log(`🧹 Deleted ${trips.length} trips`);

    // 7. Delete novedades (references students, users, trips)
    const novedades = await ctx.db.query("novedades").collect();
    for (const novedad of novedades) {
      await ctx.db.delete(novedad._id);
    }
    counts.novedades = novedades.length;
    console.log(`🧹 Deleted ${novedades.length} novedades`);

    // 8. Delete routeChangeRequests (references students, users)
    const routeChangeRequests = await ctx.db.query("routeChangeRequests").collect();
    for (const req of routeChangeRequests) {
      await ctx.db.delete(req._id);
    }
    counts.routeChangeRequests = routeChangeRequests.length;
    console.log(`🧹 Deleted ${routeChangeRequests.length} routeChangeRequests`);

    // 9. Delete incidents (references trips, users)
    const incidents = await ctx.db.query("incidents").collect();
    for (const incident of incidents) {
      await ctx.db.delete(incident._id);
    }
    counts.incidents = incidents.length;
    console.log(`🧹 Deleted ${incidents.length} incidents`);

    // 10. Delete studentRoutes (references students, routes, stops)
    const studentRoutes = await ctx.db.query("studentRoutes").collect();
    for (const sr of studentRoutes) {
      await ctx.db.delete(sr._id);
    }
    counts.studentRoutes = studentRoutes.length;
    console.log(`🧹 Deleted ${studentRoutes.length} studentRoutes`);

    // 11. Delete routeStops (references routes)
    const routeStops = await ctx.db.query("routeStops").collect();
    for (const stop of routeStops) {
      await ctx.db.delete(stop._id);
    }
    counts.routeStops = routeStops.length;
    console.log(`🧹 Deleted ${routeStops.length} routeStops`);

    // 12. Delete routes (references institutions, vehicles, drivers, monitors)
    const routes = await ctx.db.query("routes").collect();
    for (const route of routes) {
      await ctx.db.delete(route._id);
    }
    counts.routes = routes.length;
    console.log(`🧹 Deleted ${routes.length} routes`);

    // 13. Delete students (references institutions)
    const students = await ctx.db.query("students").collect();
    for (const student of students) {
      await ctx.db.delete(student._id);
    }
    counts.students = students.length;
    console.log(`🧹 Deleted ${students.length} students`);

    // 14. Delete drivers (references users, institutions)
    const drivers = await ctx.db.query("drivers").collect();
    for (const driver of drivers) {
      await ctx.db.delete(driver._id);
    }
    counts.drivers = drivers.length;
    console.log(`🧹 Deleted ${drivers.length} drivers`);

    // 15. Delete monitors (references users, institutions)
    const monitors = await ctx.db.query("monitors").collect();
    for (const monitor of monitors) {
      await ctx.db.delete(monitor._id);
    }
    counts.monitors = monitors.length;
    console.log(`🧹 Deleted ${monitors.length} monitors`);

    // 16. Delete vehicles (references institutions)
    const vehicles = await ctx.db.query("vehicles").collect();
    for (const vehicle of vehicles) {
      await ctx.db.delete(vehicle._id);
    }
    counts.vehicles = vehicles.length;
    console.log(`🧹 Deleted ${vehicles.length} vehicles`);

    // 17. Delete invitations (references institutions, users)
    const invitations = await ctx.db.query("invitations").collect();
    for (const invitation of invitations) {
      await ctx.db.delete(invitation._id);
    }
    counts.invitations = invitations.length;
    console.log(`🧹 Deleted ${invitations.length} invitations`);

    // 18. Delete notifications (references users, institutions)
    const notifications = await ctx.db.query("notifications").collect();
    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }
    counts.notifications = notifications.length;
    console.log(`🧹 Deleted ${notifications.length} notifications`);

    // 19. Delete users (references institutions, clients)
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }
    counts.users = users.length;
    console.log(`🧹 Deleted ${users.length} users`);

    // 20. Delete institutions (references clients)
    const institutions = await ctx.db.query("institutions").collect();
    for (const institution of institutions) {
      await ctx.db.delete(institution._id);
    }
    counts.institutions = institutions.length;
    console.log(`🧹 Deleted ${institutions.length} institutions`);

    // 21. Delete clients (top level)
    const clients = await ctx.db.query("clients").collect();
    for (const client of clients) {
      await ctx.db.delete(client._id);
    }
    counts.clients = clients.length;
    console.log(`🧹 Deleted ${clients.length} clients`);

    return {
      success: true,
      message: "All data deleted successfully",
      counts,
    };
  },
});

// Type for the result of the delete operation
type DeleteResult = {
  success: boolean;
  message: string;
  counts: Record<string, number>;
};

// Public action to clear all data
export const clearAllData = action({
  args: {},
  handler: async (ctx): Promise<DeleteResult> => {
    console.log("⚠️  WARNING: Deleting ALL data from the database...");
    console.log("=".repeat(50));

    const result: DeleteResult = await ctx.runMutation(internal.seed.clearData._deleteAllData, {});

    console.log("=".repeat(50));
    console.log("✅ Database cleared successfully!");
    console.log("\n📊 Summary:");
    for (const [table, count] of Object.entries(result.counts)) {
      if (count > 0) {
        console.log(`   - ${table}: ${count} records deleted`);
      }
    }

    return result;
  },
});

// Action to check current data counts (non-destructive)
export const checkDataCounts = action({
  args: {},
  handler: async (ctx) => {
    // This runs in action context, so we just return info
    console.log("📊 Checking database status...");
    console.log("Run 'npx convex run seed/clearData:clearAllData' to delete all data");
    return { message: "Use clearAllData to delete data" };
  },
});
