'use client';

/**
 * Dashboard Notification List
 *
 * Uses shared notification list component from @altaviapp/ui.
 */

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NotificationList as SharedList } from '@altaviapp/ui';
import type { Notification } from '@/types';

interface NotificationListProps {
  notifications: Notification[];
  limit?: number;
}

export function NotificationList({ notifications, limit = 3 }: NotificationListProps) {
  const router = useRouter();

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
    category: undefined,
    read: n.read,
    createdAt: typeof n.createdAt === 'string' ? parseInt(n.createdAt, 10) || Date.now() : Date.now(),
    relatedEntityType: undefined,
    relatedEntityId: undefined,
  }));

  return (
    <SharedList
      notifications={transformedNotifications}
      onNavigate={handleNavigate}
      limit={limit}
      viewAllHref="/notifications"
      viewAllLabel="Ver todas"
      LinkComponent={Link}
    />
  );
}
