'use client';

/**
 * NotificationList Component
 *
 * Dashboard notification list with header and optional "view all" link.
 * Used for inline notification display (not dropdown).
 */

import { Bell, Loader2 } from 'lucide-react';
import { NotificationItem } from './notification-item';
import type { Notification } from './types';

export interface NotificationListProps {
  notifications: Notification[];
  isLoading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onNavigate?: (entityType: string, entityId: string) => void;
  limit?: number;
  viewAllHref?: string;
  viewAllLabel?: string;
  /**
   * Optional custom Link component (e.g., from Next.js).
   * If not provided, uses a regular anchor tag.
   */
  LinkComponent?: React.ComponentType<{ href: string; className?: string; children: React.ReactNode }>;
}

export function NotificationList({
  notifications,
  isLoading = false,
  onMarkAsRead,
  onNavigate,
  limit = 3,
  viewAllHref = '/notifications',
  viewAllLabel = 'Ver todas',
  LinkComponent,
}: NotificationListProps) {
  const displayedNotifications = notifications.slice(0, limit);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Use provided Link component or fall back to anchor
  const Link = LinkComponent || (({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) => (
    <a href={href} className={className}>{children}</a>
  ));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">Notificaciones Recientes</h3>
        </div>
        {unreadCount > 0 && (
          <span className="px-2 py-1 bg-primary text-white text-xs font-semibold rounded-full">
            {unreadCount}
          </span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : displayedNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <Bell className="w-10 h-10 mb-2 text-gray-300" />
          <p className="text-sm">No hay notificaciones recientes</p>
        </div>
      ) : (
        <div className="space-y-1 mb-4">
          {displayedNotifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}

      {/* View All Link */}
      {notifications.length > limit && (
        <Link
          href={viewAllHref}
          className="block text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {viewAllLabel} →
        </Link>
      )}
    </div>
  );
}
