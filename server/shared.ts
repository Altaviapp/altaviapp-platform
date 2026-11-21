// Consultas y avisos que usan varios módulos.
import { and, eq, gte, inArray } from "drizzle-orm";
import type { Db } from "@/db/client";
import * as t from "@/db/schema";
import { type Direction, absentSet } from "@/lib/roster";
import type { Tools } from "./core";

export async function guardiansOf(db: Db, studentIds: string[]): Promise<string[]> {
  const ids = [...new Set(studentIds)];
  if (!ids.length) return [];
  const rows = await db.select({ userId: t.guardians.userId }).from(t.guardians).where(inArray(t.guardians.studentId, ids));
  return [...new Set(rows.map((r) => r.userId))];
}

export async function isGuardian(db: Db, userId: string, studentId: string): Promise<boolean> {
  const rows = await db
    .select({ userId: t.guardians.userId })
    .from(t.guardians)
    .where(and(eq(t.guardians.studentId, studentId), eq(t.guardians.userId, userId)));
  return rows.length > 0;
}

export async function adminsOf(db: Db, schoolId: string): Promise<string[]> {
  const rows = await db
    .select({ id: t.users.id })
    .from(t.users)
    .where(and(eq(t.users.schoolId, schoolId), eq(t.users.role, "admin"), eq(t.users.active, true)));
  return rows.map((r) => r.id);
}

/** Estudiantes ausentes de un colegio para una fecha y sentido. */
export async function absentFor(db: Db, schoolId: string, date: string, direction: Direction): Promise<Set<string>> {
  const rows = await db.select().from(t.absences).where(and(eq(t.absences.schoolId, schoolId), gte(t.absences.to, date)));
  return absentSet(rows, date, direction);
}

/** Guarda el aviso en la app de cada usuario, actualiza su campana en vivo y encola el push. */
export async function notify(
  tools: Tools,
  schoolId: string,
  userIds: string[],
  title: string,
  body: string,
  tripId?: string,
) {
  const unique = [...new Set(userIds)];
  if (!unique.length) return;
  await tools.db.insert(t.notifications).values(unique.map((userId) => ({ userId, title, body, tripId, at: tools.now })));
  tools.emit(schoolId, ...unique.map((id) => `notif:${id}`));
  await tools.enqueue("push", { userIds: unique, title, body });
}
