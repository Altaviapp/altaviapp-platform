'use client';

import { GraduationCap, ChevronRight, Loader2, MapPin, Phone, Camera } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useMyStudentsWithPhotos } from '@/hooks';

export default function HijosPage() {
  const { students, isLoading, isEmpty } = useMyStudentsWithPhotos();

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
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h1 className="text-xl font-semibold text-gray-900">Mis Hijos</h1>
        <p className="text-sm text-gray-600 mt-1">
          Gestiona la información de tus hijos
        </p>
      </div>

      {/* Students List */}
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
            <Link
              key={student._id}
              href={`/hijos/${student._id}`}
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* Avatar/Photo */}
                <div className="relative">
                  {student.photoUrl ? (
                    <img
                      src={student.photoUrl}
                      alt={`${student.firstName} ${student.lastName}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  {!student.photoUrl && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white">
                      <Camera className="w-3 h-3 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{student.grade}</p>

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    {student.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {student.address.slice(0, 30)}...
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {student.parentPhone}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>

              {/* Status indicators */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                <span className={cn(
                  'text-xs px-2 py-1 rounded-full',
                  student.isActive
                    ? 'bg-success/10 text-success'
                    : 'bg-gray-100 text-gray-500'
                )}>
                  {student.isActive ? 'Activo' : 'Inactivo'}
                </span>
                {!student.photoUrl && (
                  <span className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning">
                    Sin foto
                  </span>
                )}
                {!student.homeLatitude && (
                  <span className="text-xs px-2 py-1 rounded-full bg-info/10 text-info">
                    Ubicación pendiente
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
