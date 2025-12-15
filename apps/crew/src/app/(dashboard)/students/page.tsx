'use client';

import { useState } from 'react';
import { User, Search, CheckCircle, Clock, X, Filter, ChevronDown, Phone, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock students data
const allStudents = [
  { id: 1, name: 'Carlos Rodríguez', grade: '5to A', status: 'pending', stop: 'Av. 12 de Octubre', parentPhone: '+593 99 111 2222', emergencyContact: 'María Rodríguez' },
  { id: 2, name: 'María López', grade: '5to A', status: 'pending', stop: 'Av. 12 de Octubre', parentPhone: '+593 99 333 4444', emergencyContact: 'José López' },
  { id: 3, name: 'Pedro Gómez', grade: '4to B', status: 'on_board', stop: 'Av. América', checkinTime: '06:42', parentPhone: '+593 99 555 6666', emergencyContact: 'Ana Gómez' },
  { id: 4, name: 'Ana Fernández', grade: '6to A', status: 'pending', stop: 'Av. 12 de Octubre', parentPhone: '+593 99 777 8888', emergencyContact: 'Luis Fernández' },
  { id: 5, name: 'Luis Martínez', grade: '3ro A', status: 'on_board', stop: 'Av. 10 de Agosto', checkinTime: '06:35', parentPhone: '+593 99 999 0000', emergencyContact: 'Carmen Martínez' },
  { id: 6, name: 'Sofía García', grade: '5to B', status: 'absent', stop: 'Av. América', parentPhone: '+593 98 111 2222', emergencyContact: 'Roberto García' },
  { id: 7, name: 'Diego Torres', grade: '4to A', status: 'on_board', stop: 'Av. Colón', checkinTime: '06:38', parentPhone: '+593 98 333 4444', emergencyContact: 'Paula Torres' },
  { id: 8, name: 'Valentina Mora', grade: '6to B', status: 'pending', stop: 'Av. 6 de Diciembre', parentPhone: '+593 98 555 6666', emergencyContact: 'Jorge Mora' },
  { id: 9, name: 'Mateo Ruiz', grade: '3ro B', status: 'on_board', stop: 'Av. 10 de Agosto', checkinTime: '06:35', parentPhone: '+593 98 777 8888', emergencyContact: 'Laura Ruiz' },
  { id: 10, name: 'Isabella Vargas', grade: '5to A', status: 'pending', stop: 'Av. Eloy Alfaro', parentPhone: '+593 98 999 0000', emergencyContact: 'Miguel Vargas' },
];

const statusConfig = {
  pending: { label: 'Pendiente', color: 'text-warning', bg: 'bg-warning/10', icon: Clock },
  on_board: { label: 'A bordo', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle },
  absent: { label: 'Ausente', color: 'text-error', bg: 'bg-error/10', icon: X },
  delivered: { label: 'Entregado', color: 'text-info', bg: 'bg-info/10', icon: CheckCircle },
};

const filters = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'on_board', label: 'A bordo' },
  { value: 'absent', label: 'Ausentes' },
];

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<typeof allStudents[0] | null>(null);

  const filteredStudents = allStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.stop.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || s.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Stats
  const stats = {
    total: allStudents.length,
    onBoard: allStudents.filter(s => s.status === 'on_board').length,
    pending: allStudents.filter(s => s.status === 'pending').length,
    absent: allStudents.filter(s => s.status === 'absent').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Estudiantes</h1>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{stats.onBoard}/{stats.total}</p>
          <p className="text-xs text-gray-500">a bordo</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-warning/10 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-warning">{stats.pending}</p>
          <p className="text-xs text-warning-dark">Pendientes</p>
        </div>
        <div className="bg-success/10 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-success">{stats.onBoard}</p>
          <p className="text-xs text-success-dark">A bordo</p>
        </div>
        <div className="bg-error/10 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-error">{stats.absent}</p>
          <p className="text-xs text-error-dark">Ausentes</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar estudiante..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                selectedFilter === filter.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredStudents.map((student) => {
            const status = statusConfig[student.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;

            return (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', status.bg)}>
                  <StatusIcon className={cn('w-5 h-5', status.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{student.name}</p>
                  <p className="text-xs text-gray-500">{student.grade} • {student.stop}</p>
                </div>
                <span className={cn('px-2 py-1 rounded-full text-xs font-medium', status.bg, status.color)}>
                  {status.label}
                </span>
              </button>
            );
          })}
        </div>

        {filteredStudents.length === 0 && (
          <div className="p-8 text-center">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No se encontraron estudiantes</p>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center lg:items-center">
          <div className="bg-white rounded-t-2xl lg:rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-900">Detalle del Estudiante</h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Student Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{selectedStudent.name}</h4>
                  <p className="text-sm text-gray-500">{selectedStudent.grade}</p>
                  <span className={cn(
                    'inline-block px-2 py-1 rounded-full text-xs font-medium mt-1',
                    statusConfig[selectedStudent.status as keyof typeof statusConfig].bg,
                    statusConfig[selectedStudent.status as keyof typeof statusConfig].color
                  )}>
                    {statusConfig[selectedStudent.status as keyof typeof statusConfig].label}
                  </span>
                </div>
              </div>

              {/* Stop Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Parada asignada</p>
                <p className="font-medium text-gray-900">{selectedStudent.stop}</p>
              </div>

              {/* Check-in Time */}
              {selectedStudent.status === 'on_board' && selectedStudent.checkinTime && (
                <div className="bg-success/10 rounded-lg p-3">
                  <p className="text-xs text-success-dark mb-1">Check-in realizado</p>
                  <p className="font-medium text-success">{selectedStudent.checkinTime}</p>
                </div>
              )}

              {/* Emergency Contact */}
              <div className="border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-2">Contacto de Emergencia</p>
                <p className="font-medium text-gray-900">{selectedStudent.emergencyContact}</p>
                <a
                  href={`tel:${selectedStudent.parentPhone}`}
                  className="flex items-center gap-2 text-sm text-primary mt-2"
                >
                  <Phone className="w-4 h-4" />
                  {selectedStudent.parentPhone}
                </a>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {selectedStudent.status === 'pending' && (
                  <button className="flex-1 py-3 bg-success text-white rounded-lg font-medium hover:bg-success-dark transition-colors">
                    Registrar Check-in
                  </button>
                )}
                {selectedStudent.status === 'on_board' && (
                  <button className="flex-1 py-3 bg-info text-white rounded-lg font-medium hover:bg-info-dark transition-colors">
                    Registrar Check-out
                  </button>
                )}
                <button className="py-3 px-4 bg-warning/10 text-warning rounded-lg font-medium hover:bg-warning/20 transition-colors">
                  <AlertTriangle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
