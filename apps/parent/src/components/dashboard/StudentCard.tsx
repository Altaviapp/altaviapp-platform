'use client';

import Link from 'next/link';
import { GraduationCap, Bus, MapPin, Clock, CheckCircle, ChevronRight, Bell, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type StudentStatus = 'at_home' | 'in_transit' | 'at_school' | 'returning';

interface Student {
  id: string; // Convex ID
  name: string;
  grade: string;
  photo?: string | null;
  status: StudentStatus;
  route?: string;
  nextStop?: string | null;
  eta?: string | null;
}

interface StudentCardProps {
  student: Student;
  showNovedadButton?: boolean;
}

const statusConfig: Record<StudentStatus, {
  label: string;
  bgColor: string;
  textColor: string;
  icon: typeof Bus;
}> = {
  at_home: {
    label: 'En casa',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    icon: CheckCircle,
  },
  in_transit: {
    label: 'En camino',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: Bus,
  },
  at_school: {
    label: 'En la escuela',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    icon: CheckCircle,
  },
  returning: {
    label: 'Regresando',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    icon: Bus,
  },
};

export function StudentCard({ student, showNovedadButton = true }: StudentCardProps) {
  const config = statusConfig[student.status] || statusConfig.at_home;
  const StatusIcon = config.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Student Info with link to tracking */}
      <Link href={`/tracking?student=${student.id}`} className="block">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{student.name}</p>
                <p className="text-sm text-gray-500">{student.grade}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className={cn('mt-4 p-3 rounded-lg', config.bgColor)}>
          <div className={cn('flex items-center', config.textColor)}>
            <StatusIcon className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">{config.label}</span>
          </div>

          {/* Show location details for in_transit or returning */}
          {(student.status === 'in_transit' || student.status === 'returning') && (
            <div className="mt-2 flex items-center justify-between text-sm">
              {student.nextStop && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{student.nextStop}</span>
                </div>
              )}
              {student.eta && (
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>ETA: {student.eta}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Quick Actions */}
      {showNovedadButton && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
          <Link
            href={`/novedades/create?studentId=${student.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
          >
            <Bell className="w-4 h-4" />
            Reportar Novedad
          </Link>
          <Link
            href="/novedades"
            className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="Ver novedades"
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
