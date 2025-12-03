/**
 * API Error Classes
 *
 * Custom error classes for consistent error handling across the API.
 * These can be caught and converted to appropriate HTTP responses.
 */

// ============================================================================
// BASE ERROR CLASS
// ============================================================================

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 400,
    code = "API_ERROR",
    details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: this.message,
      code: this.code,
      ...(this.details && { details: this.details }),
    };
  }
}

// ============================================================================
// SPECIFIC ERROR CLASSES
// ============================================================================

/**
 * Bad Request Error (400)
 * Use when the request is malformed or contains invalid data
 */
export class BadRequestError extends ApiError {
  constructor(message = "Solicitud inválida", details?: unknown) {
    super(message, 400, "BAD_REQUEST", details);
    this.name = "BadRequestError";
  }
}

/**
 * Unauthorized Error (401)
 * Use when authentication is required but not provided or invalid
 */
export class UnauthorizedError extends ApiError {
  constructor(message = "Autenticación requerida") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

/**
 * Forbidden Error (403)
 * Use when the user is authenticated but lacks permission
 */
export class ForbiddenError extends ApiError {
  constructor(message = "Acceso denegado") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

/**
 * Not Found Error (404)
 * Use when the requested resource doesn't exist
 */
export class NotFoundError extends ApiError {
  constructor(message = "Recurso no encontrado", resource?: string) {
    super(message, 404, "NOT_FOUND", resource ? { resource } : undefined);
    this.name = "NotFoundError";
  }
}

/**
 * Conflict Error (409)
 * Use when there's a conflict with the current state (e.g., duplicate entry)
 */
export class ConflictError extends ApiError {
  constructor(message = "Conflicto con el estado actual", details?: unknown) {
    super(message, 409, "CONFLICT", details);
    this.name = "ConflictError";
  }
}

/**
 * Validation Error (422)
 * Use when input data fails validation
 */
export class ValidationError extends ApiError {
  constructor(message = "Error de validación", details?: unknown) {
    super(message, 422, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

/**
 * Rate Limit Error (429)
 * Use when the user has exceeded rate limits
 */
export class RateLimitError extends ApiError {
  constructor(message = "Demasiadas solicitudes. Intenta más tarde.") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
    this.name = "RateLimitError";
  }
}

/**
 * Internal Server Error (500)
 * Use for unexpected server-side errors
 */
export class InternalServerError extends ApiError {
  constructor(message = "Error interno del servidor") {
    super(message, 500, "INTERNAL_ERROR");
    this.name = "InternalServerError";
  }
}

/**
 * Service Unavailable Error (503)
 * Use when a service is temporarily unavailable
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message = "Servicio no disponible temporalmente") {
    super(message, 503, "SERVICE_UNAVAILABLE");
    this.name = "ServiceUnavailableError";
  }
}

// ============================================================================
// DOMAIN-SPECIFIC ERRORS
// ============================================================================

/**
 * Institution Access Error
 * Use when user doesn't have access to an institution
 */
export class InstitutionAccessError extends ForbiddenError {
  constructor(institutionId?: string) {
    super("No tienes acceso a esta institución");
    this.name = "InstitutionAccessError";
    if (institutionId) {
      (this as any).details = { institutionId };
    }
  }
}

/**
 * Role Permission Error
 * Use when user's role doesn't have required permissions
 */
export class RolePermissionError extends ForbiddenError {
  constructor(requiredRole: string, currentRole: string) {
    super(`Permisos insuficientes. Requiere rol: ${requiredRole}, tiene: ${currentRole}`);
    this.name = "RolePermissionError";
    (this as any).details = { requiredRole, currentRole };
  }
}

/**
 * Session Expired Error
 * Use when the user's session has expired
 */
export class SessionExpiredError extends UnauthorizedError {
  constructor() {
    super("Sesión expirada. Inicia sesión nuevamente.");
    this.name = "SessionExpiredError";
  }
}

/**
 * Account Locked Error
 * Use when the user's account is locked (too many failed attempts)
 */
export class AccountLockedError extends ForbiddenError {
  constructor(minutesRemaining: number) {
    super(`Cuenta bloqueada. Intenta en ${minutesRemaining} minutos.`);
    this.name = "AccountLockedError";
    (this as any).details = { minutesRemaining };
  }
}

/**
 * Subscription Limit Error
 * Use when a subscription limit is reached
 */
export class SubscriptionLimitError extends ForbiddenError {
  constructor(resource: string, limit: number) {
    super(`Límite de ${resource} alcanzado (${limit}). Actualiza tu plan.`);
    this.name = "SubscriptionLimitError";
    (this as any).details = { resource, limit };
  }
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Convert any error to an ApiError
 */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof Error) {
    // Check for common error patterns in message
    const message = error.message.toLowerCase();

    if (message.includes("no encontrado") || message.includes("not found")) {
      return new NotFoundError(error.message);
    }

    if (message.includes("acceso denegado") || message.includes("no tienes acceso")) {
      return new ForbiddenError(error.message);
    }

    if (message.includes("autenticación") || message.includes("sesión")) {
      return new UnauthorizedError(error.message);
    }

    if (message.includes("ya existe") || message.includes("duplicado")) {
      return new ConflictError(error.message);
    }

    if (message.includes("inválido") || message.includes("formato")) {
      return new ValidationError(error.message);
    }

    return new ApiError(error.message, 500, "INTERNAL_ERROR");
  }

  return new InternalServerError();
}

/**
 * Extract error message safely from any error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Error desconocido";
}
