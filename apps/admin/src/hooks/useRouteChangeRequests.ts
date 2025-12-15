"use client";

/**
 * Route Change Requests hooks for Admin App
 *
 * Provides functionality for admins to review and approve/reject
 * permanent route change requests from parents
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

// ============================================
// PENDING REQUESTS
// ============================================

export function usePendingRequests() {
  const { userId } = useConvexAuth();

  const requests = useQuery(
    api.routeChangeRequests.getPending,
    userId ? { userId } : "skip"
  );

  return {
    requests: requests ?? [],
    isLoading: requests === undefined,
    isEmpty: requests !== undefined && requests.length === 0,
  };
}

// ============================================
// PENDING COUNT
// ============================================

export function usePendingRequestsCount() {
  const { userId } = useConvexAuth();

  const count = useQuery(
    api.routeChangeRequests.getPendingCount,
    userId ? { userId } : "skip"
  );

  return {
    count: count ?? 0,
    isLoading: count === undefined,
  };
}

// ============================================
// SINGLE REQUEST DETAIL
// ============================================

export function useRouteChangeRequest(requestId: Id<"routeChangeRequests"> | string | null) {
  const { userId } = useConvexAuth();

  const request = useQuery(
    api.routeChangeRequests.getById,
    userId && requestId
      ? { userId, requestId: requestId as Id<"routeChangeRequests"> }
      : "skip"
  );

  return {
    request,
    isLoading: request === undefined,
  };
}

// ============================================
// REVIEW MUTATIONS
// ============================================

export function useReviewMutations() {
  const { userId } = useConvexAuth();

  const reviewMutation = useMutation(api.routeChangeRequests.review);

  const approveRequest = async (
    requestId: Id<"routeChangeRequests">,
    notes?: string
  ) => {
    if (!userId) throw new Error("No autenticado");

    return reviewMutation({
      userId,
      requestId,
      action: "approve",
      notes,
    });
  };

  const rejectRequest = async (
    requestId: Id<"routeChangeRequests">,
    notes?: string
  ) => {
    if (!userId) throw new Error("No autenticado");

    return reviewMutation({
      userId,
      requestId,
      action: "reject",
      notes,
    });
  };

  return {
    approveRequest,
    rejectRequest,
    isReady: !!userId,
  };
}
