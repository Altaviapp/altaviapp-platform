'use client';

import { useState, useMemo } from 'react';
import { Users, MapPin, Search, UserPlus, UserMinus, Loader2, Sparkles, ArrowRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  homeLatitude?: number;
  homeLongitude?: number;
  isAssigned?: boolean;
  assignedStopId?: string;
}

interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
}

interface StudentAssignmentProps {
  students: Student[];
  stops: Stop[];
  assignedStudents: Array<{ studentId: string; stopId: string }>;
  onAssign: (studentId: string, stopId: string) => Promise<void>;
  onUnassign: (studentId: string) => Promise<void>;
  onAutoAssign: (assignments: Array<{ studentId: string; stopId: string }>) => Promise<void>;
  className?: string;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Return in meters
}

// Find nearest stop for a student
function findNearestStop(student: Student, stops: Stop[]): Stop | null {
  if (!student.homeLatitude || !student.homeLongitude || stops.length === 0) {
    return null;
  }

  let nearestStop: Stop | null = null;
  let minDistance = Infinity;

  for (const stop of stops) {
    const distance = calculateDistance(
      student.homeLatitude,
      student.homeLongitude,
      stop.latitude,
      stop.longitude
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestStop = stop;
    }
  }

  return nearestStop;
}

export function StudentAssignment({
  students,
  stops,
  assignedStudents,
  onAssign,
  onUnassign,
  onAutoAssign,
  className,
}: StudentAssignmentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null);
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);

  // Create a map of assignments for quick lookup
  const assignmentMap = useMemo(() => {
    const map = new Map<string, string>();
    assignedStudents.forEach((a) => map.set(a.studentId, a.stopId));
    return map;
  }, [assignedStudents]);

  // Enrich students with assignment info and nearest stop
  const enrichedStudents = useMemo(() => {
    return students.map((student) => {
      const assignedStopId = assignmentMap.get(student.id);
      const assignedStop = assignedStopId ? stops.find((s) => s.id === assignedStopId) : null;
      const nearestStop = findNearestStop(student, stops);
      const distanceToNearest =
        nearestStop && student.homeLatitude && student.homeLongitude
          ? calculateDistance(
              student.homeLatitude,
              student.homeLongitude,
              nearestStop.latitude,
              nearestStop.longitude
            )
          : null;

      return {
        ...student,
        isAssigned: !!assignedStopId,
        assignedStopId,
        assignedStop,
        nearestStop,
        distanceToNearest,
      };
    });
  }, [students, stops, assignmentMap]);

  // Filter students based on search and filters
  const filteredStudents = useMemo(() => {
    return enrichedStudents.filter((student) => {
      const matchesSearch =
        `${student.firstName} ${student.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        student.grade.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = !showUnassignedOnly || !student.isAssigned;

      const matchesStop =
        !selectedStopId || student.assignedStopId === selectedStopId;

      return matchesSearch && matchesFilter && matchesStop;
    });
  }, [enrichedStudents, searchQuery, showUnassignedOnly, selectedStopId]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = students.length;
    const assigned = enrichedStudents.filter((s) => s.isAssigned).length;
    const withLocation = students.filter((s) => s.homeLatitude && s.homeLongitude).length;
    return { total, assigned, unassigned: total - assigned, withLocation };
  }, [students, enrichedStudents]);

  // Handle auto-assignment for all unassigned students with location
  const handleAutoAssign = async () => {
    setIsLoading(true);
    try {
      const assignments: Array<{ studentId: string; stopId: string }> = [];

      enrichedStudents
        .filter((s) => !s.isAssigned && s.nearestStop)
        .forEach((student) => {
          if (student.nearestStop) {
            assignments.push({
              studentId: student.id,
              stopId: student.nearestStop.id,
            });
          }
        });

      if (assignments.length > 0) {
        await onAutoAssign(assignments);
      }
    } catch (err) {
      console.error('Auto-assign error:', err);
    }
    setIsLoading(false);
  };

  // Handle individual assignment
  const handleAssign = async (studentId: string, stopId: string) => {
    setLoadingStudentId(studentId);
    try {
      await onAssign(studentId, stopId);
    } catch (err) {
      console.error('Assign error:', err);
    }
    setLoadingStudentId(null);
  };

  // Handle unassignment
  const handleUnassign = async (studentId: string) => {
    setLoadingStudentId(studentId);
    try {
      await onUnassign(studentId);
    } catch (err) {
      console.error('Unassign error:', err);
    }
    setLoadingStudentId(null);
  };

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Asignar Estudiantes</h3>
            <p className="text-sm text-gray-500">
              {stats.assigned}/{stats.total} asignados • {stats.withLocation} con ubicación
            </p>
          </div>
        </div>
        {stats.unassigned > 0 && stats.withLocation > 0 && (
          <button
            onClick={handleAutoAssign}
            disabled={isLoading}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
              'bg-accent text-primary hover:bg-accent/90',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Asignando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Auto-asignar ({enrichedStudents.filter((s) => !s.isAssigned && s.nearestStop).length})
              </>
            )}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{stats.assigned}</p>
          <p className="text-xs text-gray-500">Asignados</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-warning">{stats.unassigned}</p>
          <p className="text-xs text-gray-500">Sin asignar</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-success">{stats.withLocation}</p>
          <p className="text-xs text-gray-500">Con ubicación</p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar estudiante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            onClick={() => setShowUnassignedOnly(!showUnassignedOnly)}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              showUnassignedOnly
                ? 'bg-warning text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Sin asignar
          </button>
        </div>

        {/* Stop filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedStopId(null)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
              !selectedStopId
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Todas las paradas
          </button>
          {stops.map((stop) => (
            <button
              key={stop.id}
              onClick={() => setSelectedStopId(stop.id === selectedStopId ? null : stop.id)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                stop.id === selectedStopId
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {stop.name}
            </button>
          ))}
        </div>
      </div>

      {/* Students List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No se encontraron estudiantes</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-medium text-sm">
                      {student.firstName[0]}{student.lastName[0]}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {student.firstName} {student.lastName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{student.grade}</span>
                      {student.homeLatitude && student.homeLongitude && (
                        <span className="flex items-center gap-1 text-success">
                          <Home className="w-3 h-3" />
                          Con ubicación
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Assignment Status */}
                  {student.isAssigned ? (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Asignado a</p>
                        <p className="text-sm font-medium text-success flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {student.assignedStop?.name}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUnassign(student.id)}
                        disabled={loadingStudentId === student.id}
                        className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                      >
                        {loadingStudentId === student.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserMinus className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {student.nearestStop && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Parada más cercana</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {student.nearestStop.name}
                            {student.distanceToNearest && (
                              <span className="text-xs text-gray-400">
                                ({Math.round(student.distanceToNearest)}m)
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                      {student.nearestStop ? (
                        <button
                          onClick={() => handleAssign(student.id, student.nearestStop!.id)}
                          disabled={loadingStudentId === student.id}
                          className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors"
                          title={`Asignar a ${student.nearestStop.name}`}
                        >
                          {loadingStudentId === student.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserPlus className="w-4 h-4" />
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-warning px-2 py-1 bg-warning/10 rounded">
                          Sin ubicación
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t text-center">
        <p className="text-xs text-gray-500">
          Los estudiantes se asignan automáticamente a la parada más cercana a su domicilio
        </p>
      </div>
    </div>
  );
}
