'use client';

import { GraduationCap, ChevronRight, MapPin, Phone, Camera } from 'lucide-react';
import Link from 'next/link';
import { LoadingState, EmptyState, Card, Badge } from '@/components/core';
import { PageHeader } from '@/components/shared';
import { useMyStudentsWithPhotos } from '@/hooks';

export default function HijosPage() {
  const { students, isLoading, isEmpty } = useMyStudentsWithPhotos();

  if (isLoading) {
    return (
      <div className="space-y-4 pb-20">
        <PageHeader title="Mis Hijos" subtitle="Gestiona la informacion de tus hijos" />
        <LoadingState message="Cargando informacion..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <PageHeader title="Mis Hijos" subtitle="Gestiona la informacion de tus hijos" />

      {/* Students List */}
      {isEmpty ? (
        <EmptyState
          icon={GraduationCap}
          title="Sin estudiantes registrados"
          description="No tienes estudiantes asociados a tu cuenta. Contacta a la institucion para mas informacion."
        />
      ) : (
        <div className="space-y-3">
          {students.map((student) => (
            <Link
              key={student._id}
              href={`/hijos/${student._id}`}
              className="block"
            >
              <Card hover padding="md">
                <div className="flex items-center gap-4">
                  {/* Avatar/Photo */}
                  <div className="relative flex-shrink-0">
                    {student.photoUrl ? (
                      <img
                        src={student.photoUrl}
                        alt={`${student.firstName} ${student.lastName}`}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="w-7 h-7 text-primary" />
                      </div>
                    )}
                    {!student.photoUrl && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white">
                        <Camera className="w-2.5 h-2.5 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">
                      {student.firstName} {student.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{student.grade}</p>

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                      {student.address && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{student.address.slice(0, 25)}...</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        {student.parentPhone}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>

                {/* Status indicators */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                  <Badge variant={student.isActive ? 'success' : 'default'} size="sm">
                    {student.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                  {!student.photoUrl && (
                    <Badge variant="warning" size="sm">
                      Sin foto
                    </Badge>
                  )}
                  {!student.homeLatitude && (
                    <Badge variant="info" size="sm">
                      Ubicacion pendiente
                    </Badge>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
