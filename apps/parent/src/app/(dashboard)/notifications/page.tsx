'use client';

import { useState, useMemo } from 'react';
import { Bell, Check, Bus, AlertTriangle, CheckCircle, Clock, Calendar, Info, AlertCircle, BellOff, CheckCheck, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications, useUnreadCount, useNotificationMutations } from '@/hooks';
import { LoadingState, Badge } from '@/components/core';

const filters = [
  { value: 'all', label: 'Todas' },
  { value: 'unread', label: 'No leídas' },
];

// Map notification types to icons and colors
const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  success: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  info: { icon: Info, color: 'text-info', bg: 'bg-info/10' },
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
  error: { icon: AlertCircle, color: 'text-error', bg: 'bg-error/10' },
};

// Map categories to specific icons
const categoryConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  checkin: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  trip_update: { icon: Bus, color: 'text-info', bg: 'bg-info/10' },
  eta: { icon: MapPin, color: 'text-warning', bg: 'bg-warning/10' },
  novedad: { icon: Bell, color: 'text-primary', bg: 'bg-primary/10' },
  incident: { icon: AlertTriangle, color: 'text-error', bg: 'bg-error/10' },
  relay: { icon: Bus, color: 'text-info', bg: 'bg-info/10' },
  approval_request: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  system: { icon: Info, color: 'text-gray-500', bg: 'bg-gray-100' },
};

// Group notifications by date
function groupNotificationsByDate(notifications: Array<{
  _id: string;
  title: string;
  message: string;
  type: string;
  category?: string;
  read: boolean;
  createdAt: number;
}>) {
  const groups: { [key: string]: typeof notifications } = {};

  for (const notification of notifications) {
    const date = new Date(notification.createdAt);
    const dateKey = date.toISOString().split('T')[0] ?? 'unknown';
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(notification);
  }

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date,
      formattedDate: formatDateLabel(date),
      items,
    }));
}

function formatDateLabel(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === today) {
    return 'Hoy';
  }
  if (dateStr === yesterdayStr) {
    return 'Ayer';
  }

  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours}h`;

  return date.toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const { notifications, isLoading, isEmpty } = useNotifications({
    unreadOnly: selectedFilter === 'unread',
    limit: 100,
  });
  const { count: unreadCount } = useUnreadCount();
  const { markAsRead, markAllAsRead } = useNotificationMutations();

  const groupedNotifications = useMemo(() => groupNotificationsByDate(notifications as any[]), [notifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId as any);
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

  if (isLoading) {
    return (
      <div className="space-y-4 pb-20">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Notificaciones</h1>
        </div>
        <LoadingState message="Cargando notificaciones..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-900">Notificaciones</h1>
          {unreadCount > 0 && (
            <Badge variant="info">{unreadCount} sin leer</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Marcar todas
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl w-fit">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedFilter(filter.value)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200',
              selectedFilter === filter.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {filter.label}
            {filter.value === 'unread' && unreadCount > 0 && (
              <span className={cn(
                'ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full transition-colors',
                selectedFilter === 'unread'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-gray-200 text-gray-600'
              )}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="relative mb-5">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
              <BellOff className="w-11 h-11 text-gray-300" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100">
              <Check className="w-5 h-5 text-success" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {selectedFilter === 'unread' ? 'Estás al día' : 'Sin notificaciones'}
          </h3>
          <p className="text-sm text-gray-500 text-center max-w-[260px]">
            {selectedFilter === 'unread'
              ? 'No tienes notificaciones pendientes por revisar'
              : 'Las notificaciones de tus hijos aparecerán aquí'}
          </p>
        </div>
      )}

      {/* Notifications List */}
      {groupedNotifications.map((group) => (
        <div key={group.date} className="space-y-3">
          {/* Date Header */}
          <div className="flex items-center gap-2.5 py-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {group.formattedDate}
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Notification Items */}
          <div className="space-y-2">
            {group.items.map((notification, index) => {
              // Get config based on category first, then type
              const config = notification.category
                ? categoryConfig[notification.category] ?? typeConfig[notification.type]
                : typeConfig[notification.type];
              const IconComponent = config?.icon ?? Bell;

              return (
                <div
                  key={notification._id}
                  className={cn(
                    'group bg-white rounded-2xl border transition-all duration-200 overflow-hidden',
                    'animate-in fade-in-0 slide-in-from-top-1',
                    notification.read
                      ? 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                      : 'border-primary/20 bg-primary/[0.02] shadow-[0_0_0_1px_inset] shadow-primary/10'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={cn(
                    'p-4 transition-colors duration-200',
                    !notification.read && 'border-l-[3px] border-l-primary'
                  )}>
                    <div className="flex gap-3.5">
                      {/* Icon */}
                      <div className={cn(
                        'relative w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105',
                        config?.bg ?? 'bg-gray-100'
                      )}>
                        <IconComponent className={cn('w-5 h-5', config?.color ?? 'text-gray-500')} />
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
                          <h3 className={cn(
                            'text-[15px] leading-snug',
                            notification.read ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'
                          )}>
                            {notification.title}
                          </h3>
                          <span className={cn(
                            'text-xs flex-shrink-0 mt-0.5',
                            notification.read ? 'text-gray-400' : 'text-primary font-medium'
                          )}>
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">{notification.message}</p>

                        {/* Mark as read button */}
                        {!notification.read && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              Marcar como leída
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
