'use client';

/**
 * StudentList Component
 *
 * Paginated list of unassigned students for bulk route creation.
 * Features:
 * - 20 students per page with pagination controls
 * - Each row shows: name, grade, abbreviated address, GPS indicator
 * - Loading skeleton while fetching
 * - Search input with 300ms debounce
 * - Filters by grade, parent, and GPS availability
 *
 * PRD References:
 * - US-005 - Step 2 - Student list with pagination
 * - US-006 - Step 2 - Student filters and search
 */

import { useQuery } from 'convex/react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MapPin,
  MapPinOff,
  ChevronLeft,
  ChevronRight,
  Users,
  Search,
  X,
  RotateCcw,
} from 'lucide-react';
import { api } from '../../../../../../convex/_generated/api';
import { cn } from '@/lib/utils';
import { useConvexAuth } from '@/hooks';
import { Input, Select, Switch } from '@/components/core';

export interface StudentListItem {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  grade: string;
  address: string;
  abbreviatedAddress: string;
  hasGps: boolean;
  homeLatitude?: number;
  homeLongitude?: number;
}

export interface StudentFilters {
  search?: string;
  grade?: string;
  parentName?: string;
  hasGps?: boolean;
}

interface StudentListProps {
  routeType: 'pickup' | 'dropoff';
  page: number;
  onPageChange: (page: number) => void;
  filters: StudentFilters;
  onFiltersChange: (filters: StudentFilters) => void;
  selectedStudentIds: string[];
  onStudentSelect: (studentId: string, selected: boolean) => void;
  onTotalCountChange?: (count: number) => void;
}

/**
 * Custom hook for debounced value
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Student Filters Bar Component
 */
interface StudentFiltersBarProps {
  routeType: 'pickup' | 'dropoff';
  filters: StudentFilters;
  onFiltersChange: (filters: StudentFilters) => void;
  onResetFilters: () => void;
}

function StudentFiltersBar({
  routeType,
  filters,
  onFiltersChange,
  onResetFilters,
}: StudentFiltersBarProps) {
  const { userId, institutionId } = useConvexAuth();
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 300);

  // Query filter options (grades and parent names)
  const filterOptions = useQuery(
    api.routes.getStudentFilterOptions,
    userId && institutionId && routeType
      ? {
          userId,
          institutionId,
          routeType,
        }
      : 'skip'
  );

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch || undefined });
    }
  }, [debouncedSearch, filters, onFiltersChange]);

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(e.target.value);
    },
    []
  );

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchInput('');
  }, []);

  // Handle grade filter change
  const handleGradeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      onFiltersChange({ ...filters, grade: value || undefined });
    },
    [filters, onFiltersChange]
  );

  // Handle parent filter change
  const handleParentChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      onFiltersChange({ ...filters, parentName: value || undefined });
    },
    [filters, onFiltersChange]
  );

  // Handle GPS toggle change
  const handleGpsToggle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ ...filters, hasGps: e.target.checked });
    },
    [filters, onFiltersChange]
  );

  // Handle reset
  const handleReset = useCallback(() => {
    setSearchInput('');
    onResetFilters();
  }, [onResetFilters]);

  // Build grade options
  const gradeOptions = useMemo(() => {
    const options = [{ value: '', label: 'Todos los grados' }];
    if (filterOptions?.grades) {
      for (const grade of filterOptions.grades) {
        options.push({ value: grade, label: grade });
      }
    }
    return options;
  }, [filterOptions?.grades]);

  // Build parent options
  const parentOptions = useMemo(() => {
    const options = [{ value: '', label: 'Todos los padres' }];
    if (filterOptions?.parentNames) {
      for (const name of filterOptions.parentNames) {
        options.push({ value: name, label: name });
      }
    }
    return options;
  }, [filterOptions?.parentNames]);

  // Check if any filters are active
  const hasActiveFilters = !!(
    filters.search ||
    filters.grade ||
    filters.parentName ||
    filters.hasGps === false
  );

  return (
    <div className="space-y-3 pb-3 border-b border-gray-200">
      {/* Search Input */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Buscar estudiante por nombre..."
          value={searchInput}
          onChange={handleSearchChange}
          leftIcon={Search}
          rightElement={
            searchInput ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            ) : undefined
          }
          className="text-sm"
        />
      </div>

      {/* Filter Dropdowns Row */}
      <div className="flex flex-wrap gap-2">
        {/* Grade Filter */}
        <div className="flex-1 min-w-[140px]">
          <Select
            options={gradeOptions}
            value={filters.grade || ''}
            onChange={handleGradeChange}
            className="text-sm py-1.5"
          />
        </div>

        {/* Parent Filter */}
        <div className="flex-1 min-w-[140px]">
          <Select
            options={parentOptions}
            value={filters.parentName || ''}
            onChange={handleParentChange}
            className="text-sm py-1.5"
          />
        </div>
      </div>

      {/* GPS Toggle and Reset */}
      <div className="flex items-center justify-between">
        <Switch
          label="Solo con ubicación GPS"
          checked={filters.hasGps !== false}
          onChange={handleGpsToggle}
          size="sm"
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}

function StudentRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="w-5 h-5 rounded bg-gray-200" />
      <div className="flex-1">
        <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
        <div className="h-3 w-48 bg-gray-200 rounded" />
      </div>
      <div className="w-4 h-4 rounded bg-gray-200" />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <StudentRowSkeleton key={i} />
      ))}
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
      <Users className="w-12 h-12 mb-3 text-gray-300" />
      <p className="font-medium">
        {hasFilters
          ? 'No se encontraron estudiantes'
          : 'No hay estudiantes disponibles'}
      </p>
      <p className="text-sm text-gray-400 mt-1">
        {hasFilters
          ? 'Intenta ajustar los filtros de búsqueda'
          : 'Todos los estudiantes ya tienen ruta asignada'}
      </p>
    </div>
  );
}

interface StudentRowProps {
  student: StudentListItem;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
}

function StudentRow({ student, isSelected, onSelect }: StudentRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(!isSelected)}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
        isSelected
          ? 'bg-primary/10 border border-primary/20'
          : 'hover:bg-gray-50 border border-transparent'
      )}
    >
      {/* Checkbox */}
      <div
        className={cn(
          'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
          isSelected
            ? 'bg-primary border-primary'
            : 'border-gray-300'
        )}
      >
        {isSelected && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>

      {/* Student Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 truncate">
            {student.fullName}
          </span>
          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
            {student.grade}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">
          {student.abbreviatedAddress}
        </p>
      </div>

      {/* GPS Indicator */}
      {student.hasGps ? (
        <MapPin className="w-4 h-4 text-success flex-shrink-0" />
      ) : (
        <MapPinOff className="w-4 h-4 text-error flex-shrink-0" />
      )}
    </button>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  limit: number;
}

function Pagination({
  page,
  totalPages,
  onPageChange,
  totalCount,
  limit,
}: PaginationProps) {
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCount);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 pt-3 mt-3">
      <p className="text-sm text-gray-500">
        {startItem}-{endItem} de {totalCount}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            page <= 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-gray-600 min-w-[4rem] text-center">
          {page} / {totalPages || 1}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            page >= totalPages
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export function StudentList({
  routeType,
  page,
  onPageChange,
  filters,
  onFiltersChange,
  selectedStudentIds,
  onStudentSelect,
  onTotalCountChange,
}: StudentListProps) {
  const { userId, institutionId } = useConvexAuth();

  // Default filters - GPS is on by default
  const defaultFilters: StudentFilters = useMemo(
    () => ({
      hasGps: true,
    }),
    []
  );

  // Reset filters handler
  const handleResetFilters = useCallback(() => {
    onFiltersChange(defaultFilters);
    // Reset to page 1 when filters change
    onPageChange(1);
  }, [defaultFilters, onFiltersChange, onPageChange]);

  // Handle filter changes - reset pagination to page 1
  const handleFiltersChange = useCallback(
    (newFilters: StudentFilters) => {
      onFiltersChange(newFilters);
      // Reset to page 1 when filters change
      onPageChange(1);
    },
    [onFiltersChange, onPageChange]
  );

  // Query unassigned students with pagination
  const result = useQuery(
    api.routes.getUnassignedStudents,
    userId && institutionId && routeType
      ? {
          userId,
          institutionId,
          routeType,
          filters: filters || defaultFilters,
          page,
          limit: 20,
        }
      : 'skip'
  );

  // Notify parent of total count changes
  const totalCount = result?.pagination.totalCount ?? 0;
  useEffect(() => {
    if (onTotalCountChange && result) {
      onTotalCountChange(totalCount);
    }
  }, [totalCount, onTotalCountChange, result]);

  // Check if any filters are active for empty state message
  const hasActiveFilters = !!(
    filters.search ||
    filters.grade ||
    filters.parentName ||
    filters.hasGps === false
  );

  return (
    <div className="flex flex-col h-full">
      {/* Filters Bar */}
      <StudentFiltersBar
        routeType={routeType}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onResetFilters={handleResetFilters}
      />

      {/* Loading state */}
      {result === undefined && (
        <div className="pt-3">
          <LoadingSkeleton />
        </div>
      )}

      {/* Empty state */}
      {result !== undefined && result.students.length === 0 && (
        <div className="pt-3">
          <EmptyState hasFilters={hasActiveFilters} />
        </div>
      )}

      {/* Student list */}
      {result !== undefined && result.students.length > 0 && (
        <>
          <div className="flex-1 overflow-y-auto space-y-1 pt-3">
            {result.students.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                isSelected={selectedStudentIds.includes(student.id)}
                onSelect={(selected) => onStudentSelect(student.id, selected)}
              />
            ))}
          </div>

          {/* Pagination */}
          {result.pagination.totalPages > 1 && (
            <Pagination
              page={result.pagination.page}
              totalPages={result.pagination.totalPages}
              onPageChange={onPageChange}
              totalCount={result.pagination.totalCount}
              limit={result.pagination.limit}
            />
          )}
        </>
      )}
    </div>
  );
}
