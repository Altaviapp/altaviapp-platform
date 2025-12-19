/**
 * Route Optimization Service
 *
 * Optimizes the order of stops using Google Maps Directions API
 * with optimizeWaypoints: true (similar to how Uber calculates routes)
 */

import type {
  LatLng,
  OptimizationResult,
  RouteStop,
  StudentForRoute,
  OptimizedStop,
  RouteOptimizationResult,
} from "../types/maps";

/**
 * Optimize the order of stops for the most efficient route
 *
 * This uses Google Maps Directions API with optimizeWaypoints: true
 * which reorders waypoints to minimize total travel time.
 *
 * @param origin - Starting point (e.g., first pickup or school)
 * @param destination - End point (e.g., school or last dropoff)
 * @param stops - Array of stops to optimize
 * @returns Optimized order and route information
 */
export async function optimizeStopOrder(
  origin: LatLng,
  destination: LatLng,
  stops: RouteStop[]
): Promise<OptimizationResult | null> {
  if (stops.length === 0) {
    return {
      optimizedOrder: [],
      totalDistance: "0 km",
      totalDuration: "0 min",
      legs: [],
    };
  }

  if (stops.length === 1) {
    return {
      optimizedOrder: [0],
      totalDistance: "Calculando...",
      totalDuration: "Calculando...",
      legs: [],
    };
  }

  try {
    const directionsService = new google.maps.DirectionsService();

    // Create waypoints from stops
    const waypoints = stops.map((stop) => ({
      location: new google.maps.LatLng(stop.position.lat, stop.position.lng),
      stopover: true,
    }));

    const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
      directionsService.route(
        {
          origin: new google.maps.LatLng(origin.lat, origin.lng),
          destination: new google.maps.LatLng(destination.lat, destination.lng),
          waypoints,
          optimizeWaypoints: true, // KEY: This tells Google to optimize the order!
          travelMode: google.maps.TravelMode.DRIVING,
          region: "EC",
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result);
          } else {
            reject(new Error(`Optimization request failed: ${status}`));
          }
        }
      );
    });

    const route = result.routes[0];
    if (!route) {
      return null;
    }

    // Get the optimized order from waypoint_order
    // waypoint_order contains the new indices of the waypoints in optimized order
    const optimizedOrder = route.waypoint_order || stops.map((_, i) => i);

    // Calculate totals
    let totalDistance = 0;
    let totalDuration = 0;
    const legs = route.legs.map((leg) => {
      totalDistance += leg.distance?.value || 0;
      totalDuration += leg.duration?.value || 0;
      return {
        distance: leg.distance?.text || "",
        duration: leg.duration?.text || "",
        startAddress: leg.start_address,
        endAddress: leg.end_address,
      };
    });

    return {
      optimizedOrder,
      totalDistance: formatDistance(totalDistance),
      totalDuration: formatDuration(totalDuration),
      legs,
    };
  } catch (error) {
    console.error("Route optimization error:", error);
    return null;
  }
}

/**
 * Reorder stops array based on optimization result
 */
export function reorderStops<T extends { id: string }>(
  stops: T[],
  optimizedOrder: number[]
): T[] {
  return optimizedOrder.map((index) => stops[index]).filter((stop): stop is T => stop !== undefined);
}

/**
 * Calculate the nearest stop for a student
 * Uses Haversine formula for distance calculation
 */
export function findNearestStop(
  studentPosition: LatLng,
  stops: RouteStop[]
): RouteStop | null {
  if (stops.length === 0) return null;

  const firstStop = stops[0];
  if (!firstStop) return null;

  let nearestStop: RouteStop = firstStop;
  let minDistance = calculateHaversineDistance(studentPosition, firstStop.position);

  for (let i = 1; i < stops.length; i++) {
    const currentStop = stops[i];
    if (!currentStop) continue;
    const distance = calculateHaversineDistance(studentPosition, currentStop.position);
    if (distance < minDistance) {
      minDistance = distance;
      nearestStop = currentStop;
    }
  }

  return nearestStop;
}

/**
 * Auto-assign students to their nearest stops
 */
export function autoAssignStudentsToStops(
  students: { id: string; position: LatLng }[],
  stops: RouteStop[]
): Map<string, string> {
  const assignments = new Map<string, string>();

  for (const student of students) {
    const nearestStop = findNearestStop(student.position, stops);
    if (nearestStop) {
      assignments.set(student.id, nearestStop.id);
    }
  }

  return assignments;
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in meters
 */
export function calculateHaversineDistance(point1: LatLng, point2: LatLng): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes} min`;
}

/**
 * Parse time string (HH:mm) to minutes since midnight
 */
function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

/**
 * Format minutes since midnight to HH:mm string
 */
function formatMinutesToTime(totalMinutes: number): string {
  // Handle negative values and wrap around midnight
  while (totalMinutes < 0) totalMinutes += 24 * 60;
  totalMinutes = totalMinutes % (24 * 60);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Create an optimized route from a list of students
 *
 * Uses Google Maps Directions API to:
 * 1. Calculate the optimal order of stops
 * 2. Get the route polyline for visualization
 * 3. Calculate ETAs based on target arrival/departure time
 *
 * @param schoolLocation - The school's location (origin for dropoff, destination for pickup)
 * @param students - Array of students with their locations
 * @param routeType - "pickup" (students → school) or "dropoff" (school → students)
 * @param targetTime - HH:mm format - arrival time at school (pickup) or departure time (dropoff)
 * @returns Optimized route with stops, ETAs, polyline, and totals
 */
export async function createOptimizedRouteFromStudents(
  schoolLocation: LatLng,
  students: StudentForRoute[],
  routeType: "pickup" | "dropoff",
  targetTime: string
): Promise<RouteOptimizationResult | null> {
  if (students.length === 0) {
    return null;
  }

  try {
    const directionsService = new google.maps.DirectionsService();

    // For pickup: students → school (school is destination)
    // For dropoff: school → students (school is origin)
    const origin = routeType === "pickup"
      ? students[0]?.position ?? schoolLocation
      : schoolLocation;
    const destination = routeType === "pickup"
      ? schoolLocation
      : students[students.length - 1]?.position ?? schoolLocation;

    // Create waypoints (all students except first for pickup, except last for dropoff)
    const waypointStudents = routeType === "pickup"
      ? students.slice(1) // First student is origin
      : students.slice(0, -1); // Last student is destination

    const waypoints = waypointStudents.map((student) => ({
      location: new google.maps.LatLng(student.position.lat, student.position.lng),
      stopover: true,
    }));

    // For pickup with >1 student, we need to include first as origin, optimize rest, then school
    // For dropoff with >1 student, school is origin, optimize students, last is destination

    // Actually, let's simplify: use all students as waypoints and let Google optimize
    const allWaypoints = students.map((student) => ({
      location: new google.maps.LatLng(student.position.lat, student.position.lng),
      stopover: true,
    }));

    const routeOrigin = routeType === "dropoff" ? schoolLocation : schoolLocation;
    const routeDestination = routeType === "pickup" ? schoolLocation : schoolLocation;

    const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
      directionsService.route(
        {
          origin: routeType === "dropoff"
            ? new google.maps.LatLng(schoolLocation.lat, schoolLocation.lng)
            : new google.maps.LatLng(allWaypoints[0]?.location.lat() ?? schoolLocation.lat, allWaypoints[0]?.location.lng() ?? schoolLocation.lng),
          destination: routeType === "pickup"
            ? new google.maps.LatLng(schoolLocation.lat, schoolLocation.lng)
            : new google.maps.LatLng(allWaypoints[allWaypoints.length - 1]?.location.lat() ?? schoolLocation.lat, allWaypoints[allWaypoints.length - 1]?.location.lng() ?? schoolLocation.lng),
          waypoints: routeType === "pickup"
            ? allWaypoints.slice(1) // First student is origin for pickup
            : allWaypoints.slice(0, -1), // Last student is destination for dropoff
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING,
          region: "EC",
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result);
          } else {
            reject(new Error(`Route optimization failed: ${status}`));
          }
        }
      );
    });

    const route = result.routes[0];
    if (!route || !route.legs) {
      return null;
    }

    // Get optimized order
    const waypointOrder = route.waypoint_order ?? [];

    // Build the ordered list of students based on optimization
    let orderedStudents: StudentForRoute[];
    if (routeType === "pickup") {
      // For pickup: first student is origin (not in waypoints), then optimized waypoints
      const firstStudent = students[0];
      const restStudents = students.slice(1);
      const optimizedRest = waypointOrder.map((i) => restStudents[i]).filter((s): s is StudentForRoute => s !== undefined);
      orderedStudents = firstStudent ? [firstStudent, ...optimizedRest] : optimizedRest;
    } else {
      // For dropoff: optimized waypoints, then last student is destination
      const lastStudent = students[students.length - 1];
      const restStudents = students.slice(0, -1);
      const optimizedRest = waypointOrder.map((i) => restStudents[i]).filter((s): s is StudentForRoute => s !== undefined);
      orderedStudents = lastStudent ? [...optimizedRest, lastStudent] : optimizedRest;
    }

    // Calculate total duration and distance
    let totalDuration = 0;
    let totalDistance = 0;
    const legDurations: number[] = [];
    const legDistances: number[] = [];

    for (const leg of route.legs) {
      const duration = leg.duration?.value ?? 0;
      const distance = leg.distance?.value ?? 0;
      totalDuration += duration;
      totalDistance += distance;
      legDurations.push(duration);
      legDistances.push(distance);
    }

    // Calculate ETAs based on route type and target time
    const targetMinutes = parseTimeToMinutes(targetTime);
    const stops: OptimizedStop[] = [];

    if (routeType === "pickup") {
      // For pickup: work backwards from school arrival time
      // School arrival is targetTime, last stop is targetTime - last leg duration, etc.
      let currentTime = targetMinutes;

      // Last leg is from last student to school
      // Start from the end
      for (let i = orderedStudents.length - 1; i >= 0; i--) {
        const student = orderedStudents[i];
        if (!student) continue;

        const legIndex = i; // leg[i] goes TO student[i+1] or school
        const legDuration = legDurations[legIndex] ?? 0;
        const legDistance = legDistances[legIndex] ?? 0;

        // Time at this stop is currentTime minus the duration to next stop
        if (i < orderedStudents.length - 1) {
          currentTime -= Math.ceil((legDurations[i + 1] ?? 0) / 60);
        }

        stops.unshift({
          studentId: student.id,
          studentName: student.name,
          position: student.position,
          address: student.address ?? "",
          order: i + 1,
          estimatedArrivalTime: formatMinutesToTime(currentTime),
          durationFromPrevious: i === 0 ? 0 : (legDurations[i] ?? 0),
          distanceFromPrevious: i === 0 ? 0 : (legDistances[i] ?? 0),
        });

        if (i > 0) {
          currentTime -= Math.ceil((legDurations[i] ?? 0) / 60);
        }
      }

      // Recalculate properly: for pickup we go FROM first student TO school
      // So leg[0] is from origin to first waypoint, leg[1] from first to second, etc.
      // Final leg is from last waypoint to school

      // Let's recalculate more accurately
      stops.length = 0;
      let accumulatedTime = 0;
      const startMinutes = targetMinutes - Math.ceil(totalDuration / 60);

      for (let i = 0; i < orderedStudents.length; i++) {
        const student = orderedStudents[i];
        if (!student) continue;

        const arrivalMinutes = startMinutes + Math.ceil(accumulatedTime / 60);
        const durationFromPrev = i === 0 ? 0 : (legDurations[i - 1] ?? 0);
        const distanceFromPrev = i === 0 ? 0 : (legDistances[i - 1] ?? 0);

        stops.push({
          studentId: student.id,
          studentName: student.name,
          position: student.position,
          address: student.address ?? "",
          order: i + 1,
          estimatedArrivalTime: formatMinutesToTime(arrivalMinutes),
          durationFromPrevious: durationFromPrev,
          distanceFromPrevious: distanceFromPrev,
        });

        if (i < route.legs.length) {
          accumulatedTime += legDurations[i] ?? 0;
        }
      }
    } else {
      // For dropoff: work forward from school departure time
      // School departure is targetTime, first stop is targetTime + first leg duration, etc.
      let accumulatedTime = 0;

      for (let i = 0; i < orderedStudents.length; i++) {
        const student = orderedStudents[i];
        if (!student) continue;

        // For dropoff, leg[0] is school → first student, leg[1] is first → second, etc.
        accumulatedTime += legDurations[i] ?? 0;
        const arrivalMinutes = targetMinutes + Math.ceil(accumulatedTime / 60);

        stops.push({
          studentId: student.id,
          studentName: student.name,
          position: student.position,
          address: student.address ?? "",
          order: i + 1,
          estimatedArrivalTime: formatMinutesToTime(arrivalMinutes),
          durationFromPrevious: legDurations[i] ?? 0,
          distanceFromPrevious: legDistances[i] ?? 0,
        });
      }
    }

    // Get encoded polyline
    const encodedPolyline = route.overview_polyline;

    // Calculate bounds
    const bounds = route.bounds;
    const boundsObj = {
      north: bounds?.getNorthEast().lat() ?? 0,
      south: bounds?.getSouthWest().lat() ?? 0,
      east: bounds?.getNorthEast().lng() ?? 0,
      west: bounds?.getSouthWest().lng() ?? 0,
    };

    // Calculate start and end times
    const startTime = routeType === "pickup"
      ? formatMinutesToTime(targetMinutes - Math.ceil(totalDuration / 60))
      : targetTime;
    const endTime = routeType === "pickup"
      ? targetTime
      : formatMinutesToTime(targetMinutes + Math.ceil(totalDuration / 60));

    return {
      stops,
      totalDuration,
      totalDistance,
      encodedPolyline,
      startTime,
      endTime,
      bounds: boundsObj,
    };
  } catch (error) {
    console.error("Route optimization error:", error);
    return null;
  }
}

/**
 * Decode a Google Maps encoded polyline to array of LatLng points
 */
export function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    // Decode latitude
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    // Decode longitude
    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    });
  }

  return points;
}
