// Reglas de la lista de un viaje (PRD §6). Funciones puras: se usan en el servidor y en pruebas.
import { toMinutes, toTime } from "./dates";

export type Direction = "to_school" | "from_school";
export type Absence = { studentId: string; from: string; to: string; direction: Direction | "both" };
export type Boarding = { studentId: string; status: "boarded" | "dropped" | "no_show" };
export type StudentStatus = "expected" | "boarded" | "dropped" | "no_show" | "absent";
export type StopLike = { id: string; time: string; studentIds: string[] };

/** ¿La ausencia cubre esa fecha y ese sentido? */
export function covers(a: Absence, date: string, direction: Direction): boolean {
  return a.from <= date && date <= a.to && (a.direction === "both" || a.direction === direction);
}

/** Estudiantes ausentes para una fecha y sentido. */
export function absentSet(absences: Absence[], date: string, direction: Direction): Set<string> {
  return new Set(absences.filter((a) => covers(a, date, direction)).map((a) => a.studentId));
}

/**
 * Estado de un estudiante en un viaje. La asistencia registrada manda sobre la
 * ausencia: si el niño apareció y subió, está a bordo aunque hubiera ausencia.
 */
export function studentStatus(
  studentId: string,
  boardings: Map<string, Boarding["status"]>,
  absent: Set<string>,
): StudentStatus {
  return boardings.get(studentId) ?? (absent.has(studentId) ? "absent" : "expected");
}

/** ¿Corre la ruta ese día de la semana? */
export function runsOn(route: { active: boolean; days: number[] }, weekday: number): boolean {
  return route.active && route.days.includes(weekday);
}

/**
 * Una parada está resuelta cuando ningún estudiante esperado sigue pendiente en ella.
 * Hacia el colegio: pendiente = aún "expected". Desde el colegio: pendiente = "boarded"
 * (va a bordo y todavía no baja). Los que no subieron en el colegio no bloquean la parada.
 */
export function stopResolved(
  stop: StopLike,
  direction: Direction,
  boardings: Map<string, Boarding["status"]>,
  absent: Set<string>,
): boolean {
  const pending = direction === "to_school" ? "expected" : "boarded";
  return stop.studentIds.every((id) => studentStatus(id, boardings, absent) !== pending);
}

/** Índice de la primera parada sin resolver (o stops.length si todas lo están). */
export function nextStopIndex(
  stops: StopLike[],
  direction: Direction,
  boardings: Map<string, Boarding["status"]>,
  absent: Set<string>,
): number {
  const i = stops.findIndex((s) => !stopResolved(s, direction, boardings, absent));
  return i === -1 ? stops.length : i;
}

/** Retraso en minutos al completar una parada (nunca negativo: ir adelantado no cuenta). */
export function delayAt(stopTime: string, nowMinutes: number): number {
  return Math.max(0, nowMinutes - toMinutes(stopTime));
}

/** Hora estimada de una parada = hora prevista + retraso observado. */
export function eta(stopTime: string, delayMin: number): string {
  return toTime(toMinutes(stopTime) + delayMin);
}

/** Resumen de asistencia de un viaje. */
export function tally(
  stops: StopLike[],
  boardings: Map<string, Boarding["status"]>,
  absent: Set<string>,
) {
  const counts = { expected: 0, boarded: 0, dropped: 0, no_show: 0, absent: 0, total: 0 };
  for (const stop of stops) {
    for (const id of stop.studentIds) {
      counts[studentStatus(id, boardings, absent)]++;
      counts.total++;
    }
  }
  return counts;
}
