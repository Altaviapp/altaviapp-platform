'use client';

import { useState } from 'react';
import {
  X,
  Users,
  UserX,
  UserCheck,
  MapPinned,
  Clock,
  CheckCircle,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
}

interface Novedad {
  _id: string;
  type: 'absence' | 'parent_pickup' | 'stop_change' | 'early_pickup' | 'late_arrival';
  studentId: string;
  studentName: string;
  stopName?: string | null;
  reason?: string;
}

interface StudentListSheetProps {
  isOpen: boolean;
  onClose: () => void;
  students: (Student | null)[];
  novedades: Novedad[];
}

type FilterType = 'all' | 'normal' | 'novedad';

const novedadTypeConfig = {
  absence: {
    label: 'No viajará',
    color: 'text-error',
    bg: 'bg-error/10',
    icon: UserX,
  },
  parent_pickup: {
    label: 'Padre recoge',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    icon: UserCheck,
  },
  stop_change: {
    label: 'Cambio de parada',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    icon: MapPinned,
  },
  early_pickup: {
    label: 'Salida temprana',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    icon: Clock,
  },
  late_arrival: {
    label: 'Llegada tarde',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    icon: Clock,
  },
};

export function StudentListSheet({
  isOpen,
  onClose,
  students,
  novedades,
}: StudentListSheetProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  if (!isOpen) return null;

  const validStudents = students.filter(Boolean) as Student[];

  // Map novedades by studentId for quick lookup
  const novedadMap = new Map<string, Novedad>();
  novedades.forEach((n) => {
    novedadMap.set(n.studentId, n);
  });

  // Filter students based on selection
  const filteredStudents = validStudents.filter((student) => {
    const hasNovedad = novedadMap.has(student.id);
    if (filter === 'normal') return !hasNovedad;
    if (filter === 'novedad') return hasNovedad;
    return true;
  });

  const normalCount = validStudents.filter((s) => !novedadMap.has(s.id)).length;
  const novedadCount = validStudents.filter((s) => novedadMap.has(s.id)).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl max-h-[80vh] flex flex-col animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-gray-900">
              Estudiantes ({validStudents.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 px-4 py-3 border-b border-gray-100">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <Filter className="w-4 h-4" />
            Todos ({validStudents.length})
          </button>
          <button
            onClick={() => setFilter('normal')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              filter === 'normal'
                ? 'bg-success text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <CheckCircle className="w-4 h-4" />
            Normal ({normalCount})
          </button>
          <button
            onClick={() => setFilter('novedad')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              filter === 'novedad'
                ? 'bg-warning text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <UserX className="w-4 h-4" />
            Novedades ({novedadCount})
          </button>
        </div>

        {/* Student list */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay estudiantes con este filtro
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map((student) => {
                const novedad = novedadMap.get(student.id);
                const config = novedad ? novedadTypeConfig[novedad.type] : null;
                const Icon = config?.icon;

                return (
                  <div
                    key={student.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl',
                      novedad ? config?.bg : 'bg-gray-50'
                    )}
                  >
                    {/* Avatar */}
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                      novedad ? config?.bg : 'bg-primary/10 text-primary'
                    )}>
                      {student.firstName?.[0] || ''}{student.lastName?.[0] || ''}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'font-medium',
                        novedad ? config?.color : 'text-gray-900'
                      )}>
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {student.grade}
                        {novedad && config && ` • ${config.label}`}
                      </p>
                    </div>

                    {/* Status icon */}
                    {novedad && Icon ? (
                      <Icon className={cn('w-5 h-5 flex-shrink-0', config?.color)} />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="p-4 border-t border-gray-200 safe-area-pb">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
