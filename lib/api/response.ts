/**
 * API Response Helpers
 *
 * Standard response format for all API endpoints.
 * Used primarily for Next.js API routes (not Convex HTTP actions).
 *
 * Response format:
 * - Success: { success: true, data: {...}, message?: string }
 * - Error: { success: false, error: string, code?: string, details?: any }
 */

import { NextResponse } from "next/server";

// ============================================================================
// TYPES
// ============================================================================

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================================================
// SUCCESS RESPONSES
// ============================================================================

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  options?: {
    message?: string;
    status?: number;
    meta?: ApiSuccessResponse["meta"];
  }
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true as const,
      data,
      ...(options?.message && { message: options.message }),
      ...(options?.meta && { meta: options.meta }),
    },
    { status: options?.status || 200 }
  );
}

/**
 * Create a created response (201)
 */
export function createdResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiSuccessResponse<T>> {
  return successResponse(data, { status: 201, message });
}

/**
 * Create a no content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

/**
 * Create an error response
 */
export function errorResponse(
  error: string,
  options?: {
    status?: number;
    code?: string;
    details?: unknown;
  }
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false as const,
      error,
      ...(options?.code && { code: options.code }),
      ...(options?.details && { details: options.details }),
    },
    { status: options?.status || 400 }
  );
}

/**
 * Create a bad request response (400)
 */
export function badRequestResponse(
  error: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return errorResponse(error, { status: 400, code: "BAD_REQUEST", details });
}

/**
 * Create an unauthorized response (401)
 */
export function unauthorizedResponse(
  error = "Autenticación requerida"
): NextResponse<ApiErrorResponse> {
  return errorResponse(error, { status: 401, code: "UNAUTHORIZED" });
}

/**
 * Create a forbidden response (403)
 */
export function forbiddenResponse(
  error = "Acceso denegado"
): NextResponse<ApiErrorResponse> {
  return errorResponse(error, { status: 403, code: "FORBIDDEN" });
}

/**
 * Create a not found response (404)
 */
export function notFoundResponse(
  error = "Recurso no encontrado"
): NextResponse<ApiErrorResponse> {
  return errorResponse(error, { status: 404, code: "NOT_FOUND" });
}

/**
 * Create a conflict response (409)
 */
export function conflictResponse(
  error: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return errorResponse(error, { status: 409, code: "CONFLICT", details });
}

/**
 * Create a validation error response (422)
 */
export function validationErrorResponse(
  error: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return errorResponse(error, { status: 422, code: "VALIDATION_ERROR", details });
}

/**
 * Create an internal server error response (500)
 */
export function internalErrorResponse(
  error = "Error interno del servidor"
): NextResponse<ApiErrorResponse> {
  return errorResponse(error, { status: 500, code: "INTERNAL_ERROR" });
}

// ============================================================================
// PAGINATION HELPERS
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedData<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  items: T[],
  total: number,
  params: PaginationParams
): NextResponse<ApiSuccessResponse<T[]>> {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const totalPages = Math.ceil(total / limit);

  return successResponse(items, {
    meta: {
      page,
      limit,
      total,
      hasMore: page < totalPages,
    },
  });
}

/**
 * Parse pagination from search params
 */
export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)), // Max 100 items per page
  };
}

// ============================================================================
// CONVEX RESPONSE HELPERS
// ============================================================================

/**
 * Standard success response for Convex mutations/queries
 * Used directly in return statements (not NextResponse)
 */
export function convexSuccess<T>(data: T, message?: string): { success: true; data: T; message?: string } {
  return {
    success: true as const,
    data,
    ...(message && { message }),
  };
}

/**
 * Standard error format for Convex (throw Error with message)
 * Use: throw convexError("message") or throw new Error("message")
 */
export function convexError(message: string): Error {
  return new Error(message);
}
