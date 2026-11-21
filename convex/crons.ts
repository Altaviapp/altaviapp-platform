import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.interval("rutas sin iniciar", { minutes: 5 }, internal.trips.lateStarts);
crons.daily("limpieza", { hourUTC: 8, minuteUTC: 0 }, internal.trips.cleanup);
export default crons;
