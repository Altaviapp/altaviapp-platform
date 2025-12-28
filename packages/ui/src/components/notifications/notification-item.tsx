'use client';

/**
 * NotificationItem Component
 *
 * Single notification row with icon, title, message, time, and unread indicator.
 * Supports click-to-navigate to related entities.
 */

import { getNotificationConfig } from '../../lib/notifications/category-config';
import { formatRelativeTime } from '../../lib/notifications/format-time';
import type { Notification } from './types';

export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onNavigate?: (entityType: string, entityId: string) => void;
  variant?: 'compact' | 'default';
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onNavigate,
  variant = 'default',
}: NotificationItemProps) {
  const config = getNotificationConfig(notification.category, notification.type);
  const Icon = config.icon;

  const handleClick = () => {
    // Mark as read
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification._id);
    }

    // Navigate to related entity
    if (
      onNavigate &&
      notification.relatedEntityType &&
      notification.relatedEntityId
    ) {
      onNavigate(notification.relatedEntityType, notification.relatedEntityId);
    }
  };

  const isCompact = variant === 'compact';
  const isClickable =
    onMarkAsRead || (notification.relatedEntityType && onNavigate);

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      className={`
        flex items-start gap-3 p-3 rounded-lg transition-colors
        ${isClickable ? 'cursor-pointer hover:bg-gray-50' : ''}
        ${!notification.read ? 'bg-gray-50/50' : ''}
      `}
    >
      {/* Icon */}
      <div
        className={`
          flex items-center justify-center flex-shrink-0 rounded-full
          ${config.bg}
          ${isCompact ? 'w-8 h-8' : 'w-10 h-10'}
        `}
      >
        <Icon
          className={`${config.color} ${isCompact ? 'w-4 h-4' : 'w-5 h-5'}`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`
            font-medium text-gray-900 line-clamp-2
            ${isCompact ? 'text-xs' : 'text-sm'}
          `}
        >
          {notification.title}
        </p>
        {!isCompact && notification.message && (
          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
            {notification.message}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {/* Unread indicator */}
      {!notification.read && (
        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  );
}
