"use client";

/**
 * Notifications hooks for Admin app
 *
 * Provides notification management for administrators
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

// ============================================
// LIST NOTIFICATIONS
// ============================================

export function useNotifications(options?: { unreadOnly?: boolean; limit?: number }) {
  const { userId } = useConvexAuth();

  const notifications = useQuery(
    api.notifications.getNotifications,
    userId
      ? { userId, unreadOnly: options?.unreadOnly, limit: options?.limit }
      : "skip"
  );

  return {
    notifications: notifications ?? [],
    isLoading: notifications === undefined,
    isEmpty: notifications !== undefined && notifications.length === 0,
  };
}

// ============================================
// UNREAD COUNT
// ============================================

export function useUnreadCount() {
  const { userId } = useConvexAuth();

  const result = useQuery(
    api.notifications.getUnreadCount,
    userId ? { userId } : "skip"
  );

  return {
    count: result?.count ?? 0,
    isLoading: result === undefined,
    hasUnread: (result?.count ?? 0) > 0,
  };
}

// ============================================
// NOTIFICATION MUTATIONS
// ============================================

export function useNotificationMutations() {
  const { userId } = useConvexAuth();

  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);
  const clearOldNotifications = useMutation(api.notifications.clearOldNotifications);

  return {
    markAsRead: async (notificationId: Id<"notifications">) => {
      if (!userId) throw new Error("Not authenticated");
      return markAsRead({ userId, notificationId });
    },

    markAllAsRead: async () => {
      if (!userId) throw new Error("Not authenticated");
      return markAllAsRead({ userId });
    },

    deleteNotification: async (notificationId: Id<"notifications">) => {
      if (!userId) throw new Error("Not authenticated");
      return deleteNotification({ userId, notificationId });
    },

    clearOldNotifications: async (olderThanDays?: number) => {
      if (!userId) throw new Error("Not authenticated");
      return clearOldNotifications({ userId, olderThanDays });
    },
  };
}

// ============================================
// UNREAD NOTIFICATIONS ONLY
// ============================================

export function useUnreadNotifications(limit?: number) {
  return useNotifications({ unreadOnly: true, limit });
}
