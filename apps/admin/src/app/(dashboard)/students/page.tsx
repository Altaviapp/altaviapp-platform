'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Plus, QrCode, MapPin, Download, Upload } from 'lucide-react';
import { Badge } from '@/components/core';
import { PageHeader, SearchFilter, DataTable, StatsGrid, type Column, type StatItem } from '@/components/shared';
import { getInitials } from '@/lib/format';
import { useStudents } from '@/hooks';
import { cn } from '@/lib/utils';

/**
 * Students Page
 *
 * Manages all students in the institution.
 * Features: search, grade filter, status filter, QR codes.
 *
 * PRD Reference: Students Module
 */

const GRADE_FILTERS = ['Todos', '1ro', '2do', '3ro', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo'];

export default function StudentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('');

  // Use real hook
  const { students, isLoading, isEmpty } = useStudents(
    statusFilter === 'active' ? { isActive: true } :
    statusFilter === 'inactive' ? { isActive: false } :
    undefined
  );

  // Filter students based on search and grade
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        fullName.includes(searchQuery.toLowerCase()) ||
        student.parentEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.parentName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGrade =
        selectedGrade === 'Todos' ||
        student.grade?.toLowerCase().includes(selectedGrade.toLowerCase().replace('ro', '').replace('do', '').replace('to', '').replace('mo', '').replace('vo', '').replace('no', ''));

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
    {
      key: 'qr',
      header: 'QR',
      align: 'center',
      render: (student) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (student.qrCode) router.push(`/students/${student._id}/qr`);
          }}
          className={cn(
            'p-2 rounded-lg transition-colors',
            student.qrCode
              ? 'hover:bg-gray-100 text-primary'
              : 'text-gray-300 cursor-not-allowed'
          )}
          disabled={!student.qrCode}
        >
          <QrCode className="w-5 h-5" />
        </button>
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
            label: 'Exportar',
            icon: Download,
            variant: 'secondary',
            onClick: () => {/* TODO: Export */},
          },
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
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
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
            ]}
            onFilterChange={(key, value) => {
              if (key === 'status') setStatusFilter(value);
            }}
            className="flex-1"
          />

          {/* Grade Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {GRADE_FILTERS.map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                  selectedGrade === grade
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>
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
