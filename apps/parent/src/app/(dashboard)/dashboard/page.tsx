'use client';

import { useMemo } from 'react';
import { Calendar, Users, Loader2, GraduationCap } from 'lucide-react';
import { StudentCard } from '@/components/dashboard/StudentCard';
import { ActivityList } from '@/components/dashboard/ActivityList';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { getGreeting, formatDate } from '@/lib/utils';
import { useMyStudents, useConvexAuth } from '@/hooks';

// Mock activity data (would come from check-ins API in full implementation)
const recentActivity = [
  { id: 1, student: 'Estudiante', action: 'Sin actividad reciente', time: '-', type: 'notification' as const },
];

// Helper to determine student status based on time of day
function getStudentStatus(): 'at_home' | 'in_transit' | 'at_school' {
  // Check time of day for school/home status
  const hour = new Date().getHours();
  if (hour >= 8 && hour <= 15) return 'at_school';
  return 'at_home';
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useConvexAuth();
  const { students: rawStudents, isLoading: studentsLoading, isEmpty } = useMyStudents();

  // Transform students to card format
  const students = useMemo(() => {
    const status = getStudentStatus();
    return rawStudents.map((student) => ({
      id: student._id, // Use real Convex ID for novedad links
      name: `${student.firstName} ${student.lastName}`,
      grade: student.grade || 'Sin grado',
      photo: null,
      status,
      route: undefined,
      nextStop: null,
      eta: null,
    }));
  }, [rawStudents]);

  const isLoading = authLoading || studentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          {getGreeting()}, {user?.name?.split(' ')[0] ?? 'Padre'}
        </h1>
        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
          <Calendar className="w-4 h-4" />
          {formatDate(new Date())}
        </p>
      </div>

      {/* Students Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Mis Hijos
        </h2>
        {isEmpty ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin estudiantes registrados</h3>
            <p className="text-gray-500">
              No tienes estudiantes asociados a tu cuenta. Contacta a la institución para más información.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {students.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <ActivityList activities={recentActivity} limit={5} />

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
