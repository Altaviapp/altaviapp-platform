/**
 * GPS Webhook Processing
 *
 * Handles sandbox webhooks for configuration and provides
 * payload analysis for field mapping setup.
 */

import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { verifyInstitutionAccess } from "./lib/simpleAuth";

// ============================================
// TYPES
// ============================================

interface FieldPath {
  path: string;
  value: unknown;
  type: string;
}

// ============================================
// SANDBOX MUTATIONS
// ============================================

/**
 * Process a sandbox webhook (stores sample without affecting trips)
 * Called from HTTP endpoint /gps/sandbox
 */
export const processSandboxWebhook = mutation({
  args: {
    institutionToken: v.string(),
    rawPayload: v.string(),
    sourceIp: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify institution by API token
    const institution = await ctx.db
      .query("institutions")
      .withIndex("by_api_token", (q) => q.eq("apiToken", args.institutionToken))
      .first();

    if (!institution) {
      throw new Error("Token de institución inválido");
    }

    if (!institution.isActive) {
      throw new Error("La institución está inactiva");
    }

    // Parse the payload to extract what we can
    let parsedPayload: Record<string, unknown>;
    try {
      parsedPayload = JSON.parse(args.rawPayload);
    } catch {
      throw new Error("El payload no es JSON válido");
    }

    // Try to auto-detect some fields
    const autoDetected = autoDetectFields(parsedPayload);

    // Store the sample
    const sampleId = await ctx.db.insert("gpsWebhookSamples", {
      institutionId: institution._id,
      rawPayload: args.rawPayload,
      parsedFields: autoDetected,
      receivedAt: Date.now(),
      sourceIp: args.sourceIp,
      isProcessed: false,
    });

    return {
      success: true,
      sampleId,
      autoDetectedFields: autoDetected,
    };
  },
});

/**
 * Mark a sample as processed (used when configuring a device)
 */
export const markSampleProcessed = mutation({
  args: {
    userId: v.id("users"),
    sampleId: v.id("gpsWebhookSamples"),
    deviceId: v.optional(v.id("gpsDevices")),
  },
  handler: async (ctx, args) => {
    const sample = await ctx.db.get(args.sampleId);
    if (!sample) {
      throw new Error("Sample no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, sample.institutionId);

    await ctx.db.patch(args.sampleId, {
      isProcessed: true,
      deviceId: args.deviceId,
    });

    return { success: true };
  },
});

/**
 * Delete old samples (cleanup, called periodically)
 */
export const cleanupOldSamples = internalMutation({
  args: {
    maxAgeMs: v.number(), // e.g., 7 days = 7 * 24 * 60 * 60 * 1000
  },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.maxAgeMs;

    // Get all old samples
    const oldSamples = await ctx.db
      .query("gpsWebhookSamples")
      .filter((q) => q.lt(q.field("receivedAt"), cutoff))
      .collect();

    // Delete them
    for (const sample of oldSamples) {
      await ctx.db.delete(sample._id);
    }

    return { deleted: oldSamples.length };
  },
});

// ============================================
// QUERIES
// ============================================

/**
 * Get sandbox samples for an institution
 */
export const getSandboxSamples = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    limit: v.optional(v.number()),
    unprocessedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    let samples = await ctx.db
      .query("gpsWebhookSamples")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .order("desc")
      .take(args.limit || 50);

    if (args.unprocessedOnly) {
      samples = samples.filter((s) => !s.isProcessed);
    }

    return samples.map((sample) => ({
      ...sample,
      // Parse raw payload for display
      payload: safeJsonParse(sample.rawPayload),
      receivedAgo: Math.floor((Date.now() - sample.receivedAt) / 1000),
    }));
  },
});

/**
 * Get a single sample with full details
 */
export const getSample = query({
  args: {
    userId: v.id("users"),
    sampleId: v.id("gpsWebhookSamples"),
  },
  handler: async (ctx, args) => {
    const sample = await ctx.db.get(args.sampleId);
    if (!sample) {
      throw new Error("Sample no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, sample.institutionId);

    const payload = safeJsonParse(sample.rawPayload);
    const fieldPaths = extractAllFieldPaths(payload);

    return {
      ...sample,
      payload,
      fieldPaths, // All possible paths for field mapping
    };
  },
});

/**
 * Analyze payload structure and suggest field mappings
 */
export const analyzePayloadStructure = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    payload: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(args.payload);
    } catch {
      throw new Error("El payload no es JSON válido");
    }

    // Extract all field paths
    const fieldPaths = extractAllFieldPaths(parsed);

    // Suggest mappings based on common patterns
    const suggestions = suggestFieldMappings(fieldPaths);

    return {
      fieldPaths,
      suggestions,
      autoDetected: autoDetectFields(parsed),
    };
  },
});

/**
 * Test field mapping against a payload
 */
export const testFieldMapping = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    payload: v.string(),
    fieldMapping: v.object({
      latitude: v.string(),
      longitude: v.string(),
      speed: v.optional(v.string()),
      heading: v.optional(v.string()),
      timestamp: v.optional(v.string()),
      deviceIdField: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(args.payload);
    } catch {
      throw new Error("El payload no es JSON válido");
    }

    // Extract values using the mapping
    const result = extractFieldsWithMapping(parsed, args.fieldMapping);

    return result;
  },
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Safely parse JSON, return empty object on error
 */
function safeJsonParse(json: string): Record<string, unknown> {
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

/**
 * Extract all field paths from an object (for dropdown options)
 * Returns paths like "data.position.lat", "location.coordinates[0]", etc.
 */
function extractAllFieldPaths(
  obj: unknown,
  prefix: string = "",
  paths: FieldPath[] = []
): FieldPath[] {
  if (obj === null || obj === undefined) {
    return paths;
  }

  if (Array.isArray(obj)) {
    // For arrays, show first element paths
    if (obj.length > 0) {
      extractAllFieldPaths(obj[0], `${prefix}[0]`, paths);
    }
    return paths;
  }

  if (typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      const newPrefix = prefix ? `${prefix}.${key}` : key;

      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        // Recurse into nested objects
        extractAllFieldPaths(value, newPrefix, paths);
      } else {
        // Add this path
        paths.push({
          path: newPrefix,
          value: value,
          type: Array.isArray(value) ? "array" : typeof value,
        });
      }
    }
  }

  return paths;
}

/**
 * Get value from object using dot notation path
 * Supports paths like "data.position.lat" and "coordinates[0]"
 */
function getValueByPath(obj: unknown, path: string): unknown {
  if (!path || obj === null || obj === undefined) {
    return undefined;
  }

  const parts = path.split(/\.|\[|\]/).filter(Boolean);
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (typeof current === "object") {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Auto-detect GPS fields from common patterns
 */
function autoDetectFields(payload: Record<string, unknown>): {
  latitude?: number;
  longitude?: number;
  speed?: number;
  heading?: number;
  timestamp?: number;
  detectedDeviceId?: string;
} {
  const result: {
    latitude?: number;
    longitude?: number;
    speed?: number;
    heading?: number;
    timestamp?: number;
    detectedDeviceId?: string;
  } = {};

  // Common latitude field names
  const latPaths = [
    "lat", "latitude", "Latitude", "LAT",
    "data.lat", "data.latitude",
    "position.lat", "position.latitude",
    "location.lat", "location.latitude",
    "gps.lat", "gps.latitude",
    "coords.latitude",
  ];

  // Common longitude field names
  const lonPaths = [
    "lon", "lng", "longitude", "Longitude", "LON", "LNG",
    "data.lon", "data.lng", "data.longitude",
    "position.lon", "position.lng", "position.longitude",
    "location.lon", "location.lng", "location.longitude",
    "gps.lon", "gps.lng", "gps.longitude",
    "coords.longitude",
  ];

  // Common speed field names
  const speedPaths = [
    "speed", "Speed", "SPEED",
    "data.speed", "position.speed", "gps.speed",
    "velocity", "spd",
  ];

  // Common heading field names
  const headingPaths = [
    "heading", "Heading", "HEADING",
    "data.heading", "position.heading", "gps.heading",
    "bearing", "course", "direction",
  ];

  // Common device ID field names
  const deviceIdPaths = [
    "deviceId", "device_id", "DeviceId", "DEVICE_ID",
    "imei", "IMEI", "Imei",
    "serial", "serialNumber", "serial_number",
    "id", "ID", "Id",
    "tracker_id", "trackerId",
  ];

  // Common timestamp field names
  const timestampPaths = [
    "timestamp", "Timestamp", "TIMESTAMP",
    "time", "Time", "TIME",
    "datetime", "dateTime", "DateTime",
    "data.timestamp", "gps.timestamp",
    "created_at", "createdAt",
    "ts", "epoch",
  ];

  // Try to find latitude
  for (const path of latPaths) {
    const val = getValueByPath(payload, path);
    if (typeof val === "number" && val >= -90 && val <= 90) {
      result.latitude = val;
      break;
    }
  }

  // Try to find longitude
  for (const path of lonPaths) {
    const val = getValueByPath(payload, path);
    if (typeof val === "number" && val >= -180 && val <= 180) {
      result.longitude = val;
      break;
    }
  }

  // Try to find speed
  for (const path of speedPaths) {
    const val = getValueByPath(payload, path);
    if (typeof val === "number" && val >= 0) {
      result.speed = val;
      break;
    }
  }

  // Try to find heading
  for (const path of headingPaths) {
    const val = getValueByPath(payload, path);
    if (typeof val === "number" && val >= 0 && val <= 360) {
      result.heading = val;
      break;
    }
  }

  // Try to find device ID
  for (const path of deviceIdPaths) {
    const val = getValueByPath(payload, path);
    if (typeof val === "string" && val.length > 0) {
      result.detectedDeviceId = val;
      break;
    }
  }

  // Try to find timestamp
  for (const path of timestampPaths) {
    const val = getValueByPath(payload, path);
    if (typeof val === "number") {
      // Check if it's seconds or milliseconds
      result.timestamp = val > 9999999999 ? val : val * 1000;
      break;
    }
    if (typeof val === "string") {
      const parsed = Date.parse(val);
      if (!isNaN(parsed)) {
        result.timestamp = parsed;
        break;
      }
    }
  }

  return result;
}

/**
 * Suggest field mappings based on detected paths
 */
function suggestFieldMappings(fieldPaths: FieldPath[]): {
  latitude?: string;
  longitude?: string;
  speed?: string;
  heading?: string;
  timestamp?: string;
  deviceIdField?: string;
} {
  const suggestions: {
    latitude?: string;
    longitude?: string;
    speed?: string;
    heading?: string;
    timestamp?: string;
    deviceIdField?: string;
  } = {};

  // Patterns to match for each field
  const patterns = {
    latitude: /^(lat|latitude)$/i,
    longitude: /^(lon|lng|longitude)$/i,
    speed: /^(speed|velocity|spd)$/i,
    heading: /^(heading|bearing|course|direction)$/i,
    timestamp: /^(timestamp|time|datetime|ts|created_at|epoch)$/i,
    deviceIdField: /^(device_?id|imei|serial|tracker_?id|id)$/i,
  };

  for (const field of fieldPaths) {
    const lastPart = field.path.split(".").pop() || "";

    for (const [key, pattern] of Object.entries(patterns)) {
      if (
        pattern.test(lastPart) &&
        !suggestions[key as keyof typeof suggestions]
      ) {
        suggestions[key as keyof typeof suggestions] = field.path;
      }
    }
  }

  return suggestions;
}

/**
 * Extract fields from payload using configured mapping
 */
function extractFieldsWithMapping(
  payload: Record<string, unknown>,
  mapping: {
    latitude: string;
    longitude: string;
    speed?: string;
    heading?: string;
    timestamp?: string;
    deviceIdField: string;
  }
): {
  success: boolean;
  latitude?: number;
  longitude?: number;
  speed?: number;
  heading?: number;
  timestamp?: number;
  deviceId?: string;
  errors: string[];
} {
  const errors: string[] = [];

  // Extract latitude
  const lat = getValueByPath(payload, mapping.latitude);
  if (typeof lat !== "number") {
    errors.push(`Latitude: no se encontró un número en "${mapping.latitude}"`);
  } else if (lat < -90 || lat > 90) {
    errors.push(`Latitude: valor fuera de rango (-90 a 90): ${lat}`);
  }

  // Extract longitude
  const lon = getValueByPath(payload, mapping.longitude);
  if (typeof lon !== "number") {
    errors.push(`Longitude: no se encontró un número en "${mapping.longitude}"`);
  } else if (lon < -180 || lon > 180) {
    errors.push(`Longitude: valor fuera de rango (-180 a 180): ${lon}`);
  }

  // Extract device ID
  const deviceId = getValueByPath(payload, mapping.deviceIdField);
  if (typeof deviceId !== "string" || deviceId.length === 0) {
    errors.push(`Device ID: no se encontró texto en "${mapping.deviceIdField}"`);
  }

  // Extract optional fields
  const speed = mapping.speed ? getValueByPath(payload, mapping.speed) : undefined;
  const heading = mapping.heading ? getValueByPath(payload, mapping.heading) : undefined;
  const timestamp = mapping.timestamp ? getValueByPath(payload, mapping.timestamp) : undefined;

  return {
    success: errors.length === 0,
    latitude: typeof lat === "number" ? lat : undefined,
    longitude: typeof lon === "number" ? lon : undefined,
    speed: typeof speed === "number" ? speed : undefined,
    heading: typeof heading === "number" ? heading : undefined,
    timestamp: typeof timestamp === "number" ? timestamp : undefined,
    deviceId: typeof deviceId === "string" ? deviceId : undefined,
    errors,
  };
}

/**
 * Process GPS data using device field mapping
 * Used by the main /gps/device endpoint
 */
export const processGpsWithMapping = mutation({
  args: {
    institutionToken: v.string(),
    rawPayload: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Verify institution
    const institution = await ctx.db
      .query("institutions")
      .withIndex("by_api_token", (q) => q.eq("apiToken", args.institutionToken))
      .first();

    if (!institution) {
      throw new Error("Token de institución inválido");
    }

    if (!institution.isActive) {
      throw new Error("La institución está inactiva");
    }

    // 2. Parse payload
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(args.rawPayload);
    } catch {
      throw new Error("El payload no es JSON válido");
    }

    // 3. Find all active devices for this institution and try to match
    const devices = await ctx.db
      .query("gpsDevices")
      .withIndex("by_institution", (q) => q.eq("institutionId", institution._id))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();

    if (devices.length === 0) {
      return {
        success: false,
        error: "No hay dispositivos GPS activos configurados",
        recorded: false,
      };
    }

    // 4. Try to match device by extracting deviceId from payload
    let matchedDevice = null;
    let extractedData = null;

    for (const device of devices) {
      if (!device.fieldMapping) continue;

      const result = extractFieldsWithMapping(payload, device.fieldMapping);

      if (result.success && result.deviceId === device.deviceId) {
        matchedDevice = device;
        extractedData = result;
        break;
      }
    }

    if (!matchedDevice || !extractedData) {
      return {
        success: false,
        error: "No se encontró dispositivo que coincida con el payload",
        recorded: false,
      };
    }

    // 5. Update device lastSeen and lastPayloadSample
    const now = Date.now();
    await ctx.db.patch(matchedDevice._id, {
      lastSeen: now,
      lastPayloadSample: args.rawPayload,
      updatedAt: now,
    });

    // 6. If device has vehicle, find active trip and record GPS
    if (!matchedDevice.vehicleId) {
      return {
        success: true,
        message: "GPS recibido, pero el dispositivo no está asignado a un vehículo",
        recorded: false,
        deviceId: matchedDevice.deviceId,
      };
    }

    // Find active trip for this vehicle
    const today = new Date().toISOString().split("T")[0]!;
    const activeTrips = await ctx.db
      .query("trips")
      .withIndex("by_date", (q) => q.eq("scheduledDate", today))
      .filter((q) =>
        q.and(
          q.eq(q.field("vehicleId"), matchedDevice.vehicleId),
          q.eq(q.field("status"), "in_progress")
        )
      )
      .collect();

    if (activeTrips.length === 0) {
      return {
        success: true,
        message: "GPS recibido, pero no hay viaje activo para este vehículo",
        recorded: false,
        deviceId: matchedDevice.deviceId,
      };
    }

    const trip = activeTrips[0]!;

    // 7. Insert GPS tracking record
    await ctx.db.insert("gpsTracking", {
      tripId: trip._id,
      latitude: extractedData.latitude!,
      longitude: extractedData.longitude!,
      speed: extractedData.speed,
      heading: extractedData.heading,
      timestamp: extractedData.timestamp || now,
      source: "device",
      deviceId: matchedDevice.deviceId,
    });

    // 8. Check geofences (simplified - full implementation in gpsTracking.ts)
    const route = await ctx.db.get(trip.routeId);
    const stops = route
      ? await ctx.db
          .query("routeStops")
          .withIndex("by_route", (q) => q.eq("routeId", route._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect()
      : [];

    const alerts = [];
    for (const stop of stops) {
      const distance = calculateDistance(
        extractedData.latitude!,
        extractedData.longitude!,
        stop.latitude,
        stop.longitude
      );
      if (distance <= stop.geofenceRadius) {
        alerts.push({
          stopId: stop._id,
          stopName: stop.name,
          message: "Vehículo llegó a la parada",
        });
      }
    }

    return {
      success: true,
      recorded: true,
      tripId: trip._id,
      deviceId: matchedDevice.deviceId,
      vehiclePlate: (await ctx.db.get(matchedDevice.vehicleId))?.licensePlate,
      geofenceAlerts: alerts,
    };
  },
});

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
