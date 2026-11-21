// Fechas y horas en la zona horaria del colegio. Sin dependencias.

export type LocalNow = { date: string; weekday: number; minutes: number };

/** Fecha "YYYY-MM-DD", día de la semana (0 = domingo) y minutos desde medianoche. */
export function localNow(timezone: string, at: number = Date.now()): LocalNow {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(new Date(at));
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    weekday,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function toTime(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export function isDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
}

export function isTime(s: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
}

/** Suma días a una fecha "YYYY-MM-DD". */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export const TIMEZONES = [
  ["America/Guayaquil", "Ecuador"],
  ["America/Bogota", "Colombia"],
  ["America/Lima", "Perú"],
  ["America/Mexico_City", "México (centro)"],
  ["America/Santiago", "Chile"],
  ["America/Argentina/Buenos_Aires", "Argentina"],
  ["America/Panama", "Panamá"],
  ["America/Costa_Rica", "Costa Rica"],
] as const;
