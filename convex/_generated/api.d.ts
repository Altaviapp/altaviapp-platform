/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as email from "../email.js";
import type * as faces from "../faces.js";
import type * as family from "../family.js";
import type * as lib from "../lib.js";
import type * as notifications from "../notifications.js";
import type * as push from "../push.js";
import type * as routes from "../routes.js";
import type * as students from "../students.js";
import type * as team from "../team.js";
import type * as trips from "../trips.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  crons: typeof crons;
  email: typeof email;
  faces: typeof faces;
  family: typeof family;
  lib: typeof lib;
  notifications: typeof notifications;
  push: typeof push;
  routes: typeof routes;
  students: typeof students;
  team: typeof team;
  trips: typeof trips;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
