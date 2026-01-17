'use client';

import { useState, useMemo } from 'react';
import { GraduationCap, Plus, MapPin, Upload } from 'lucide-react';
import { Badge } from '@/components/core';
import { PageHeader, SearchFilter, DataTable, StatsGrid, type Column, type StatItem } from '@/components/shared';
import { getInitials } from '@/lib/format';
import { useStudents } from '@/hooks';

/**
 * Students Page
 *
 * Manages all students in the institution.
 * Features: search, grade filter, status filter.
 *
 * PRD Reference: Students Module
 */

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Use real hook
  const { students, isLoading, isEmpty } = useStudents(
    statusFilter === 'active' ? { isActive: true } :
    statusFilter === 'inactive' ? { isActive: false } :
    undefined
  );

  // Extract unique grades from students
  const availableGrades = useMemo(() => {
    const grades = new Set<string>();
    students.forEach((student) => {
      if (student.grade) grades.add(student.grade);
    });
    return Array.from(grades).sort();
  }, [students]);

  // Filter students based on search and grade
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        fullName.includes(searchQuery.toLowerCase()) ||
        student.parentEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.parentName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGrade = !selectedGrade || student.grade === selectedGrade;

      return matchesSearch && matchesGrade;
    });
  }, [students, searchQuery, selectedGrade]);

  // Calculate stats
  const stats: StatItem[] = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.isActive).length;
    const withLocation = students.filter((s) => s.homeLatitude && s.homeLongitude).length;
    const inactive = students.filter((s) => !s.isActive).length;

    return [
      { label: 'Total Estudiantes', value: total, icon: GraduationCap, color: 'default' },
      { label: 'Activos', value: active, icon: GraduationCap, color: 'success' },
      { label: 'Con Ubicación', value: withLocation, icon: MapPin, color: 'info' },
      { label: 'Inactivos', value: inactive, icon: GraduationCap, color: 'warning' },
    ];
  }, [students]);

  // Table columns
  const columns: Column<(typeof students)[0]>[] = [
    {
      key: 'name',
      header: 'Estudiante',
      render: (student) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium text-sm">
              {getInitials(student.firstName, student.lastName)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {student.firstName} {student.lastName}
            </p>
            <p className="text-sm text-gray-500">{student.parentEmail || 'Sin email'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'grade',
      header: 'Grado',
      render: (student) => (
        <span className="text-gray-600">{student.grade || '-'}</span>
      ),
    },
    {
      key: 'location',
      header: 'Ubicación',
      render: (student) =>
        student.homeLatitude && student.homeLongitude ? (
          <div className="flex items-center gap-1 text-green-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Con ubicación</span>
          </div>
        ) : (
          <span className="text-yellow-600 text-sm">Sin ubicación</span>
        ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (student) => (
        <Badge variant={student.isActive ? 'success' : 'default'}>
          {student.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Gestión de Estudiantes"
        subtitle="Administra los estudiantes de la institución"
        actions={[
          {
            label: 'Importar CSV',
            href: '/students/import',
            icon: Upload,
            variant: 'secondary',
          },
          {
            label: 'Nuevo Estudiante',
            href: '/students/new',
            icon: Plus,
            variant: 'primary',
          },
        ]}
      />

      {/* Stats */}
      <StatsGrid stats={stats} isLoading={isLoading} columns={4} />

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <SearchFilter
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Buscar por nombre, email..."
          filters={[
            {
              key: 'status',
              label: 'Todos los estados',
              value: statusFilter,
              options: [
                { value: 'active', label: 'Activos' },
                { value: 'inactive', label: 'Inactivos' },
              ],
            },
            {
              key: 'grade',
              label: 'Todos los grados',
              value: selectedGrade,
              options: availableGrades.map((grade) => ({
                value: grade,
                label: grade,
              })),
            },
          ]}
          onFilterChange={(key, value) => {
            if (key === 'status') setStatusFilter(value);
            if (key === 'grade') setSelectedGrade(value);
          }}
        />
      </div>

      {/* Students Table */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        isLoading={isLoading}
        keyExtractor={(s) => s._id}
        rowHref={(s) => `/students/${s._id}`}
        emptyState={{
          icon: GraduationCap,
          title: isEmpty ? 'No hay estudiantes' : 'Sin resultados',
          description: isEmpty
            ? 'Agrega estudiantes para comenzar'
            : 'No se encontraron estudiantes con los filtros actuales',
          action: isEmpty
            ? { label: 'Nuevo Estudiante', href: '/students/new' }
            : undefined,
        }}
      />
    </div>
  );
}
