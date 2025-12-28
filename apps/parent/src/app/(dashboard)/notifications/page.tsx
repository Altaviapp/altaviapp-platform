'use client';

import { useState, useMemo } from 'react';
import { Bell, Check, MapPin, Bus, AlertTriangle, CheckCircle, Clock, Calendar, Settings, ChevronDown, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useNotifications, useUnreadCount, useNotificationMutations, useMyStudents } from '@/hooks';
import { LoadingState, EmptyState, Card, Badge, Button } from '@/components/core';
import { PageHeader } from '@/components/shared';

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
  const { students } = useMyStudents();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string }>({ id: 'all', name: 'Todos' });
  const [showStudentSelector, setShowStudentSelector] = useState(false);

  const { notifications, isLoading, isEmpty } = useNotifications({
    unreadOnly: selectedFilter === 'unread',
    limit: 100,
  });
  const { count: unreadCount } = useUnreadCount();
  const { markAsRead, markAllAsRead } = useNotificationMutations();

  const studentOptions = useMemo(() => [
    { id: 'all', name: 'Todos' },
    ...students.map((s) => ({ id: s._id, name: `${s.firstName} ${s.lastName}` })),
  ], [students]);

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
        <PageHeader
          title="Notificaciones"
          subtitle="Centro de notificaciones"
        />
        <LoadingState message="Cargando notificaciones..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header with Settings */}
      <PageHeader
        title="Notificaciones"
        badge={unreadCount > 0 ? <Badge variant="info">{unreadCount} sin leer</Badge> : undefined}
        actions={[
          ...(unreadCount > 0 ? [{
            label: 'Marcar todas',
            onClick: handleMarkAllAsRead,
            variant: 'secondary' as const,
          }] : []),
          {
            label: '',
            icon: Settings,
            href: '/settings',
            variant: 'secondary' as const,
          },
        ]}
      />

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedFilter(filter.value)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              selectedFilter === filter.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {filter.label}
          </button>
        ))}

        {/* Student Filter */}
        {students.length > 1 && (
          <div className="relative ml-auto">
            <button
              onClick={() => setShowStudentSelector(!showStudentSelector)}
              className="flex items-center gap-1 px-3 py-2 rounded-full bg-gray-100 text-sm text-gray-600 hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              {selectedStudent.name}
              <ChevronDown className={cn('w-4 h-4 transition-transform', showStudentSelector && 'rotate-180')} />
            </button>

            {showStudentSelector && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-10 overflow-hidden min-w-[150px]">
                {studentOptions.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowStudentSelector(false);
                    }}
                    className={cn(
                      'w-full p-3 text-left text-sm hover:bg-gray-50 transition-colors',
                      selectedStudent.id === student.id && 'bg-primary-50 text-primary'
                    )}
                  >
                    {student.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Empty State */}
      {isEmpty && (
        <EmptyState
          icon={Bell}
          title="Sin notificaciones"
          description={selectedFilter === 'unread'
            ? 'No tienes notificaciones sin leer.'
            : 'No tienes notificaciones aún.'}
        />
      )}

      {/* Notifications List */}
      {groupedNotifications.map((group) => (
        <div key={group.date}>
          {/* Date Header */}
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              {group.formattedDate} - {group.date}
            </span>
          </div>

          {/* Notification Items */}
          <div className="space-y-3">
            {group.items.map((notification) => {
              // Get config based on category first, then type
              const config = notification.category
                ? categoryConfig[notification.category] ?? typeConfig[notification.type]
                : typeConfig[notification.type];
              const IconComponent = config?.icon ?? Bell;

              return (
                <div
                  key={notification._id}
                  className={cn(
                    'bg-white rounded-xl border p-4 transition-colors',
                    notification.read ? 'border-gray-200' : 'border-primary/30 bg-primary-50/30'
                  )}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', config?.bg ?? 'bg-gray-100')}>
                      <IconComponent className={cn('w-5 h-5', config?.color ?? 'text-gray-500')} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={cn('font-medium', notification.read ? 'text-gray-700' : 'text-gray-900')}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>

                      {/* Actions */}
                      <div className="flex items-center gap-4 mt-3">
                        {notification.category === 'trip_update' || notification.category === 'eta' ? (
                          <Link
                            href="/tracking"
                            className="flex items-center gap-1 text-sm text-info hover:underline"
                          >
                            <MapPin className="w-4 h-4" />
                            Ver en mapa
                          </Link>
                        ) : null}
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                          >
                            <Check className="w-4 h-4" />
                            Marcar como leída
                          </button>
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
