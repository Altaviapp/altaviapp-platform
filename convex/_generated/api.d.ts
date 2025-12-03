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
import type * as authApi from "../authApi.js";
import type * as checkins from "../checkins.js";
import type * as clients from "../clients.js";
import type * as drivers from "../drivers.js";
import type * as emailVerification from "../emailVerification.js";
import type * as gpsTracking from "../gpsTracking.js";
import type * as http from "../http.js";
import type * as incidents from "../incidents.js";
import type * as institutions from "../institutions.js";
import type * as invitations from "../invitations.js";
import type * as lib_authUtils from "../lib/authUtils.js";
import type * as lib_emailTemplates from "../lib/emailTemplates.js";
import type * as lib_simpleAuth from "../lib/simpleAuth.js";
import type * as lib_tokenUtils from "../lib/tokenUtils.js";
import type * as monitors from "../monitors.js";
import type * as notifications from "../notifications.js";
import type * as routeStops from "../routeStops.js";
import type * as routes from "../routes.js";
import type * as studentRoutes from "../studentRoutes.js";
import type * as students from "../students.js";
import type * as trips from "../trips.js";
import type * as users from "../users.js";
import type * as vehicles from "../vehicles.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  authApi: typeof authApi;
  checkins: typeof checkins;
  clients: typeof clients;
  drivers: typeof drivers;
  emailVerification: typeof emailVerification;
  gpsTracking: typeof gpsTracking;
  http: typeof http;
  incidents: typeof incidents;
  institutions: typeof institutions;
  invitations: typeof invitations;
  "lib/authUtils": typeof lib_authUtils;
  "lib/emailTemplates": typeof lib_emailTemplates;
  "lib/simpleAuth": typeof lib_simpleAuth;
  "lib/tokenUtils": typeof lib_tokenUtils;
  monitors: typeof monitors;
  notifications: typeof notifications;
  routeStops: typeof routeStops;
  routes: typeof routes;
  studentRoutes: typeof studentRoutes;
  students: typeof students;
  trips: typeof trips;
  users: typeof users;
  vehicles: typeof vehicles;
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
