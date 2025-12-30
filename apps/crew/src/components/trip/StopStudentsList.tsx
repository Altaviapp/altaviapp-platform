'use client';

import { useMemo } from 'react';
import { MapPin, CheckCircle, User, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade?: string;
}

interface Stop {
  id: string;
  name: string;
  address?: string;
  order: number;
}

interface TripStudent {
  student: Student | null;
  stop: Stop | null;
  status: 'scheduled' | 'absent' | 'parent_pickup' | 'stop_changed';
  checkinStatus?: 'pending' | 'checked_in' | 'checked_out';
  novedad?: {
    id: string;
    typeName: string;
    typeCategory: string;
    notes?: string;
  } | null;
}

interface StopStudentsListProps {
  tripStudents: TripStudent[];
  currentStopIndex?: number;
  routeType?: 'pickup' | 'dropoff';
  className?: string;
}

// Status display configuration
const studentStatusConfig: Record<string, { label: string; icon: typeof User; color: string; bgColor: string }> = {
  checked_in: { label: 'A bordo', icon: CheckCircle, color: 'text-primary', bgColor: 'bg-primary/10' },
  checked_out: { label: 'Entregado', icon: CheckCircle, color: 'text-success', bgColor: 'bg-success/10' },
  pending: { label: 'Pendiente', icon: Clock, color: 'text-gray-400', bgColor: 'bg-gray-100' },
  absent: { label: 'Ausente', icon: AlertCircle, color: 'text-error', bgColor: 'bg-error/10' },
  parent_pickup: { label: 'Recoge padre', icon: User, color: 'text-warning', bgColor: 'bg-warning/10' },
  stop_changed: { label: 'Cambio parada', icon: MapPin, color: 'text-info', bgColor: 'bg-info/10' },
};

export function StopStudentsList({
  tripStudents,
  currentStopIndex = -1,
  routeType = 'pickup',
  className,
}: StopStudentsListProps) {
  // Group students by stop
  const stopGroups = useMemo(() => {
    const groups = new Map<string, { stop: Stop; students: TripStudent[] }>();

    tripStudents.forEach((ts) => {
      if (!ts.stop) return;

      const key = ts.stop.id;
      if (!groups.has(key)) {
        groups.set(key, { stop: ts.stop, students: [] });
      }
      groups.get(key)!.students.push(ts);
    });

    // Sort by stop order
    return Array.from(groups.values()).sort((a, b) => a.stop.order - b.stop.order);
  }, [tripStudents]);

  if (stopGroups.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No hay estudiantes en este viaje</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {stopGroups.map((group, index) => {
        const isCompleted = index < currentStopIndex;
        const isCurrent = index === currentStopIndex;
        const isPending = index > currentStopIndex;

        return (
          <div key={group.stop.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Stop Header */}
            <div className={cn(
              'flex items-center gap-3 p-3 border-b border-gray-100',
              isCompleted && 'bg-success/5',
              isCurrent && 'bg-primary/5',
            )}>
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                isCompleted && 'bg-success text-white',
                isCurrent && 'bg-primary text-white',
                isPending && 'bg-gray-200 text-gray-600',
              )}>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  group.stop.order
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'font-medium text-sm truncate',
                  isCompleted ? 'text-success' : isCurrent ? 'text-primary' : 'text-gray-900'
                )}>
                  {group.stop.name}
                </p>
                {group.stop.address && (
                  <p className="text-xs text-gray-500 truncate">{group.stop.address}</p>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {group.students.length} estudiante{group.students.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Students List */}
            <div className="divide-y divide-gray-50">
              {group.students.map((ts) => {
                if (!ts.student) return null;

                // Determine display status
                let displayStatus: keyof typeof studentStatusConfig = ts.checkinStatus || 'pending';
                if (ts.status === 'absent') displayStatus = 'absent';
                if (ts.status === 'parent_pickup') displayStatus = 'parent_pickup';
                if (ts.status === 'stop_changed') displayStatus = 'stop_changed';

                const config = studentStatusConfig[displayStatus] || studentStatusConfig.pending;
                if (!config) return null; // Type guard
                const StatusIcon = config.icon;

                return (
                  <div
                    key={ts.student.id}
                    className={cn(
                      'flex items-center gap-3 p-3',
                      (ts.status === 'absent' || ts.status === 'parent_pickup') && 'bg-gray-50 opacity-60'
                    )}
                  >
                    {/* Status Icon */}
                    <div className={cn('w-6 h-6 rounded-full flex items-center justify-center', config.bgColor)}>
                      <StatusIcon className={cn('w-3 h-3', config.color)} />
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium truncate',
                        (ts.status === 'absent' || ts.status === 'parent_pickup') ? 'text-gray-500 line-through' : 'text-gray-900'
                      )}>
                        {ts.student.firstName} {ts.student.lastName}
                      </p>
                      {ts.student.grade && (
                        <p className="text-xs text-gray-400">{ts.student.grade}</p>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full whitespace-nowrap',
                      config.bgColor,
                      config.color
                    )}>
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Novedad indicator if any student has one */}
            {group.students.some(ts => ts.novedad) && (
              <div className="px-3 py-2 bg-warning/5 border-t border-warning/20">
                <div className="flex items-center gap-2 text-xs text-warning">
                  <AlertCircle className="w-3 h-3" />
                  <span>Hay novedades en esta parada</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
