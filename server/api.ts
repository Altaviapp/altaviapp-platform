// Registro de todas las funciones públicas de la API. El cliente llama `modulo.funcion`.
import * as auth from "./auth";
import * as billing from "./billing";
import * as faces from "./faces";
import * as family from "./family";
import * as notifications from "./notifications";
import * as owner from "./owner";
import * as routes from "./routes";
import * as students from "./students";
import * as team from "./team";
import * as trips from "./trips";
import type { Fn } from "./core";

const pick = <M extends Record<string, unknown>, K extends keyof M>(module: M, ...names: K[]) =>
  Object.fromEntries(names.map((name) => [name, module[name]])) as Pick<M, K>;

export const api = {
  auth: pick(auth, "requestCode", "verifyCode", "registerSchool", "signOut", "me"),
  students: pick(students, "list", "save", "importRows", "archive"),
  faces: pick(faces, "enroll", "remove", "forTrip"),
  team: pick(team, "list", "saveMember", "saveVehicle", "saveSchool"),
  routes: pick(routes, "list", "plan", "save", "remove"),
  trips: pick(trips, "myDay", "start", "mark", "depart", "finish", "position", "notice", "detail", "livePosition", "today", "livePositions", "history", "close"),
  family: pick(family, "home", "activity", "reportAbsence", "cancelAbsence"),
  notifications: pick(notifications, "mine", "readAll", "subscribe", "unsubscribe"),
  billing: pick(billing, "status", "saveInfo", "checkout"),
  owner: pick(owner, "schools", "update", "recordPayment"),
};

export type Api = typeof api;

export function findFn(name: string): Fn | undefined {
  const [module, fn, extra] = name.split(".");
  const has = (object: object, key: string) => Object.prototype.hasOwnProperty.call(object, key);
  if (extra !== undefined || !module || !fn || !has(api, module)) return undefined;
  const functions = (api as Record<string, Record<string, Fn>>)[module];
  return has(functions, fn) ? functions[fn] : undefined;
}
