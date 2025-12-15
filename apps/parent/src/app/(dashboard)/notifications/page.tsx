'use client';

import { useState } from 'react';
import { Bell, Check, MapPin, Bus, AlertTriangle, CheckCircle, Clock, Calendar, Settings, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Mock notifications data
const notifications = [
  {
    date: 'Hoy - 03/12/2024',
    items: [
      {
        id: 1,
        type: 'checkin',
        title: 'Check-in exitoso',
        message: 'Sofía García abordó el bus a las 07:45',
        detail: 'Ruta: Centro - Escuela Altaviapp',
        time: 'Hace 15 min',
        read: false,
        priority: 'normal',
      },
      {
        id: 2,
        type: 'proximity',
        title: 'Bus cerca de tu parada',
        message: 'El bus llegará a la parada de Sofía en 5 minutos',
        detail: 'Hora estimada: 07:45',
        time: 'Hace 20 min',
        read: false,
        priority: 'high',
      },
      {
        id: 3,
        type: 'trip_started',
        title: 'Viaje iniciado',
        message: 'El conductor Juan Pérez ha iniciado el viaje de ida',
        detail: 'Ruta: Centro - Escuela Altaviapp',
        time: 'Hace 35 min',
        read: true,
        priority: 'normal',
      },
      {
        id: 4,
        type: 'delay',
        title: 'Retraso en la ruta',
        message: 'La ruta Centro - Escuela tiene un retraso de 10 minutos',
        detail: 'Debido a tráfico. Nueva hora estimada: 08:25',
        time: 'Hace 1 hora',
        read: true,
        priority: 'urgent',
      },
    ],
  },
  {
    date: 'Ayer - 02/12/2024',
    items: [
      {
        id: 5,
        type: 'checkout',
        title: 'Llegada exitosa',
        message: 'Sofía llegó a casa. Check-out completado.',
        detail: 'Duración del viaje: 29 minutos',
        time: '14:32',
        read: true,
        priority: 'normal',
      },
      {
        id: 6,
        type: 'checkin',
        title: 'Check-in exitoso',
        message: 'Sofía abordó el bus a las 14:03',
        detail: 'Ruta: Escuela Altaviapp - Centro',
        time: '14:03',
        read: true,
        priority: 'normal',
      },
      {
        id: 7,
        type: 'checkout',
        title: 'Llegada a la escuela',
        message: 'Sofía llegó a Escuela Altaviapp. Check-out completado.',
        detail: 'Duración del viaje: 26 minutos',
        time: '08:08',
        read: true,
        priority: 'normal',
      },
    ],
  },
];

const filters = [
  { value: 'all', label: 'Todas' },
  { value: 'unread', label: 'No leídas' },
  { value: 'important', label: 'Importantes' },
];

const students = [
  { id: 'all', name: 'Todos' },
  { id: 1, name: 'Sofía García' },
  { id: 2, name: 'Carlos García' },
];

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  checkin: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  checkout: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  proximity: { icon: MapPin, color: 'text-warning', bg: 'bg-warning/10' },
  trip_started: { icon: Bus, color: 'text-info', bg: 'bg-info/10' },
  delay: { icon: AlertTriangle, color: 'text-error', bg: 'bg-error/10' },
  incident: { icon: AlertTriangle, color: 'text-error', bg: 'bg-error/10' },
};

const priorityColors: Record<string, string> = {
  normal: 'bg-success',
  high: 'bg-warning',
  urgent: 'bg-error',
};

export default function NotificationsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(students[0]!);
  const [showStudentSelector, setShowStudentSelector] = useState(false);

  const unreadCount = notifications.flatMap(d => d.items).filter(n => !n.read).length;

  return (
    <div className="space-y-4">
      {/* Header with Settings */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500">{unreadCount} sin leer</p>
          )}
        </div>
        <Link
          href="/settings"
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </Link>
      </div>

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
              {students.map((student) => (
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
      </div>

      {/* Notifications List */}
      {notifications.map((day) => (
        <div key={day.date}>
          {/* Date Header */}
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">{day.date}</span>
          </div>

          {/* Notification Items */}
          <div className="space-y-3">
            {day.items.map((notification) => {
              const typeInfo = typeConfig[notification.type] ?? typeConfig.checkin!;
              const IconComponent = typeInfo.icon;

              return (
                <div
                  key={notification.id}
                  className={cn(
                    'bg-white rounded-xl border p-4 transition-colors',
                    notification.read ? 'border-gray-200' : 'border-primary/30 bg-primary-50/30'
                  )}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', typeInfo.bg)}>
                      <IconComponent className={cn('w-5 h-5', typeInfo.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={cn('font-medium', notification.read ? 'text-gray-700' : 'text-gray-900')}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-500">{notification.time}</span>
                          <div className={cn('w-2 h-2 rounded-full', priorityColors[notification.priority])} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.detail}</p>

                      {/* Actions */}
                      <div className="flex items-center gap-4 mt-3">
                        {(notification.type === 'proximity' || notification.type === 'trip_started') && (
                          <Link
                            href="/tracking"
                            className="flex items-center gap-1 text-sm text-info hover:underline"
                          >
                            <MapPin className="w-4 h-4" />
                            Ver en mapa
                          </Link>
                        )}
                        {!notification.read && (
                          <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
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

      {/* Load More */}
      <button className="w-full py-3 text-center text-sm text-primary font-medium hover:underline">
        Cargar más notificaciones...
      </button>
    </div>
  );
}
