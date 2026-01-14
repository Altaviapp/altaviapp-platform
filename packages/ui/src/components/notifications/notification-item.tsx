'use client';

/**
 * NotificationItem Component
 *
 * Single notification row with icon, title, message, time, and unread indicator.
 * Supports click-to-navigate to related entities.
 * Enhanced UI with better visual hierarchy and hover states.
 */

import { getNotificationConfig } from '../../lib/notifications/category-config';
import { formatRelativeTime } from '../../lib/notifications/format-time';
import { ChevronRight } from 'lucide-react';
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
  const hasNavigation = notification.relatedEntityType && notification.relatedEntityId && onNavigate;

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      className={`
        group flex items-start gap-3 px-4 py-3.5 transition-all duration-150
        ${isClickable ? 'cursor-pointer' : ''}
        ${!notification.read
          ? 'bg-primary/[0.03] hover:bg-primary/[0.06] border-l-2 border-l-primary'
          : 'hover:bg-gray-50/80 border-l-2 border-l-transparent'
        }
      `}
    >
      {/* Icon */}
      <div
        className={`
          relative flex items-center justify-center flex-shrink-0 rounded-xl
          transition-transform duration-150 group-hover:scale-105
          ${config.bg}
          ${isCompact ? 'w-9 h-9' : 'w-11 h-11'}
        `}
      >
        <Icon
          className={`${config.color} ${isCompact ? 'w-4 h-4' : 'w-5 h-5'}`}
        />
        {/* Unread pulse indicator */}
        {!notification.read && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5">
            <span className="absolute inset-0 bg-primary rounded-full animate-ping opacity-40" />
            <span className="absolute inset-0 bg-primary rounded-full" />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`
              line-clamp-2 transition-colors duration-150
              ${isCompact ? 'text-[13px]' : 'text-sm'}
              ${!notification.read
                ? 'font-semibold text-gray-900'
                : 'font-medium text-gray-700'
              }
            `}
          >
            {notification.title}
          </p>
          <span className={`
            text-[11px] flex-shrink-0 mt-0.5
            ${!notification.read ? 'text-primary font-medium' : 'text-gray-400'}
          `}>
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        {notification.message && (
          <p className={`
            text-gray-500 mt-1 line-clamp-2
            ${isCompact ? 'text-xs' : 'text-[13px]'}
          `}>
            {notification.message}
          </p>
        )}
      </div>

      {/* Navigation arrow */}
      {hasNavigation && (
        <ChevronRight className={`
          w-4 h-4 text-gray-300 flex-shrink-0 mt-1
          transition-all duration-150
          group-hover:text-gray-400 group-hover:translate-x-0.5
        `} />
      )}
    </div>
  );
}
