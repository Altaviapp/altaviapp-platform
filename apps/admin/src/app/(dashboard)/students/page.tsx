'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { GraduationCap, Plus, Search, MoreHorizontal, Edit, Trash2, Eye, QrCode, MapPin, Users, ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudents } from '@/hooks';

const grades = ['Todos', '1ro', '2do', '3ro', '4to', '5to', '6to'];

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Use real hook
  const { students, isLoading, isEmpty } = useStudents(
    statusFilter === 'all' ? undefined : { isActive: statusFilter === 'active' }
  );

  // Filter students based on search and grade
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        student.parentEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.parentName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade = selectedGrade === 'Todos' || student.grade?.includes(selectedGrade.replace('ro', '').replace('do', '').replace('to', ''));
      return matchesSearch && matchesGrade;
    });
  }, [students, searchQuery, selectedGrade]);

  // Calculate stats from real data
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter(s => s.isActive).length;
    const inactive = students.filter(s => !s.isActive).length;
    // Would need to join with studentRoutes to get assigned count
    const withRoute = 0;

    return [
      { label: 'Total Estudiantes', value: total, color: 'bg-primary' },
      { label: 'Estudiantes Activos', value: active, color: 'bg-success' },
      { label: 'Sin Ruta', value: total, color: 'bg-warning' }, // Placeholder
      { label: 'Inactivos', value: inactive, color: 'bg-gray-400' },
    ];
  }, [students]);

  // Get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Estudiantes</h1>
          <p className="text-gray-500">Administra los estudiantes de la institución</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-5 h-5" />
            Exportar
          </button>
          <Link
            href="/students/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Estudiante
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', stat.color)}>
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, cédula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {grades.map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  selectedGrade === grade
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {grade}
              </button>
            ))}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-gray-500">Cargando estudiantes...</span>
          </div>
        ) : isEmpty ? (
          <div className="text-center py-12">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay estudiantes</h3>
            <p className="text-gray-500 mb-4">Agrega estudiantes para comenzar</p>
            <Link
              href="/students/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Estudiante
            </Link>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin resultados</h3>
            <p className="text-gray-500">No se encontraron estudiantes con los filtros actuales</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estudiante</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Grado</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ubicación</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">QR</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-medium">
                              {getInitials(student.firstName, student.lastName)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                            <p className="text-sm text-gray-500">{student.grade || 'Sin grado'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{student.grade || '-'}</td>
                      <td className="px-4 py-3">
                        {student.homeLatitude && student.homeLongitude ? (
                          <div className="flex items-center gap-1 text-success">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">Con ubicación</span>
                          </div>
                        ) : (
                          <span className="text-warning text-sm">Sin ubicación</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'px-2 py-1 text-xs rounded-full',
                          student.isActive ? 'bg-success text-white' : 'bg-gray-400 text-white'
                        )}>
                          {student.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          className={cn(
                            'p-2 rounded-lg',
                            student.qrCode ? 'hover:bg-gray-100 text-primary' : 'text-gray-300 cursor-not-allowed'
                          )}
                          disabled={!student.qrCode}
                        >
                          <QrCode className="w-5 h-5" />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === student._id ? null : student._id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <MoreHorizontal className="w-5 h-5 text-gray-500" />
                          </button>
                          {openMenu === student._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <Link href={`/students/${student._id}`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                <Eye className="w-4 h-4" /> Ver detalles
                              </Link>
                              <Link href={`/students/${student._id}/edit`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                <Edit className="w-4 h-4" /> Editar
                              </Link>
                              <Link href={`/students/${student._id}#parents`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Ver padres
                              </Link>
                              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Asignar ruta
                              </button>
                              <Link href={`/students/${student._id}/qr`} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                <QrCode className="w-4 h-4" /> Descargar QR
                              </Link>
                              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-error">
                                <Trash2 className="w-4 h-4" /> Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">Mostrando {filteredStudents.length} de {students.length} estudiantes</p>
              <div className="flex gap-2">
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm">Página 1 de 1</span>
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
