import Link from 'next/link';
import { Info, AlertCircle, XCircle, CheckCircle, Bell } from 'lucide-react';
import type { Notification } from '@/types';
import { formatRelativeTime } from '@/lib/utils/dates';

const iconMap = {
  info: Info,
  warning: AlertCircle,
  error: XCircle,
  success: CheckCircle,
};

const colorMap = {
  info: 'text-info',
  warning: 'text-warning',
  error: 'text-error',
  success: 'text-success',
};

interface NotificationItemProps {
  notification: Notification;
}

function NotificationItem({ notification }: NotificationItemProps) {
  const Icon = iconMap[notification.type];
  const iconColor = colorMap[notification.type];

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <Icon className={`w-5 h-5 ${iconColor} mt-0.5 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 line-clamp-2">
          {notification.title}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatRelativeTime(notification.timestamp)}
        </p>
      </div>
      {!notification.read && (
        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  );
}

interface NotificationListProps {
  notifications: Notification[];
  limit?: number;
}

export function NotificationList({
  notifications,
  limit = 3,
}: NotificationListProps) {
  const displayedNotifications = notifications.slice(0, limit);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">Notificaciones Recientes</h3>
        </div>
        {notifications.filter(n => !n.read).length > 0 && (
          <span className="px-2 py-1 bg-primary text-white text-xs font-semibold rounded-full">
            {notifications.filter(n => !n.read).length}
          </span>
        )}
      </div>

      {/* Notifications */}
      <div className="space-y-1 mb-4">
        {displayedNotifications.map((notification) => (
          <NotificationItem key={notification._id} notification={notification} />
        ))}
      </div>

      {/* See All Link */}
      {notifications.length > limit && (
        <Link
          href="/notifications"
          className="block text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Ver todas →
        </Link>
      )}
    </div>
  );
}
