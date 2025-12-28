'use client';

/**
 * Crew Notification Dropdown
 *
 * Uses shared notification component from @altaviapp/ui
 * with Crew-specific navigation handlers and mobile-optimized variant.
 */

import { useRouter } from 'next/navigation';
import { NotificationDropdown as SharedDropdown } from '@altaviapp/ui';
import { useNotifications, useUnreadCount, useNotificationMutations } from '@/hooks';
import { Id } from '../../../../../convex/_generated/dataModel';

export function NotificationDropdown() {
  const router = useRouter();
  const { notifications, isLoading } = useNotifications({ limit: 10 });
  const { count } = useUnreadCount();
  const { markAsRead, markAllAsRead } = useNotificationMutations();

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id as Id<'notifications'>);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNavigate = (entityType: string, entityId: string) => {
    switch (entityType) {
      case 'incident':
        router.push(`/incidents/${entityId}`);
        break;
      case 'novedad':
        router.push('/novedades');
        break;
      case 'trip':
        router.push(`/trips/${entityId}`);
        break;
      case 'student':
        router.push(`/students/${entityId}`);
        break;
      default:
        break;
    }
  };

  // Transform notifications to match shared component interface
  const transformedNotifications = notifications.map((n) => ({
    _id: n._id,
    title: n.title,
    message: n.message,
    type: n.type as 'success' | 'info' | 'warning' | 'error',
    category: n.category,
    read: n.read,
    createdAt: n.createdAt,
    relatedEntityType: n.relatedEntityType,
    relatedEntityId: n.relatedEntityId,
  }));

  return (
    <SharedDropdown
      notifications={transformedNotifications}
      unreadCount={count}
      isLoading={isLoading}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onNavigate={handleNavigate}
      variant="mobile"
    />
  );
}
