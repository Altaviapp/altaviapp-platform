"use client";

/**
 * Hook for invitation management
 *
 * Provides invitation queries and mutations with loading/error states
 * All queries filter by institutionId for multi-tenancy
 */

import { useQuery, useMutation } from "@altaviapp/convex-client";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

export type InvitationRole = "parent" | "driver" | "monitor" | "admin";
export type InvitationStatus = "pending" | "accepted" | "expired" | "cancelled";

export function useInvitations(filters?: { status?: InvitationStatus }) {
  const { userId, institutionId } = useConvexAuth();

  const invitations = useQuery(
    api.invitations.listInvitations,
    userId && institutionId
      ? { userId, institutionId, status: filters?.status }
      : "skip"
  );

  return {
    invitations: invitations ?? [],
    isLoading: invitations === undefined,
    isEmpty: invitations !== undefined && invitations.length === 0,
  };
}

export function useInvitationMutations() {
  const { userId, institutionId } = useConvexAuth();

  const createInvitation = useMutation(api.invitations.createInvitation);
  const createBulkInvitations = useMutation(api.invitations.createBulkInvitations);
  const cancelInvitation = useMutation(api.invitations.cancelInvitation);
  const resendInvitation = useMutation(api.invitations.resendInvitation);

  return {
    createInvitation: async (data: {
      email: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      role: InvitationRole;
    }) => {
      if (!userId || !institutionId) throw new Error("Not authenticated");
      return createInvitation({ userId, institutionId, ...data });
    },

    createBulkInvitations: async (
      invitations: Array<{
        email: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        role: InvitationRole;
      }>
    ) => {
      if (!userId || !institutionId) throw new Error("Not authenticated");
      return createBulkInvitations({ userId, institutionId, invitations });
    },

    cancelInvitation: async (invitationId: Id<"invitations">) => {
      if (!userId) throw new Error("Not authenticated");
      return cancelInvitation({ userId, invitationId });
    },

    resendInvitation: async (invitationId: Id<"invitations">) => {
      if (!userId) throw new Error("Not authenticated");
      return resendInvitation({ userId, invitationId });
    },
  };
}

/**
 * Get invitation stats for dashboard
 */
export function useInvitationStats() {
  const { invitations, isLoading } = useInvitations();

  const stats = {
    total: invitations.length,
    pending: invitations.filter((i) => i.status === "pending").length,
    accepted: invitations.filter((i) => i.status === "accepted").length,
    expired: invitations.filter((i) => i.status === "expired").length,
    cancelled: invitations.filter((i) => i.status === "cancelled").length,
  };

  return {
    stats,
    isLoading,
  };
}
