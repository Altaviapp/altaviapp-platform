'use client';

import { useState, useMemo } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { useVehicles, useDrivers } from '@/hooks';
import { Id } from '../../../../../convex/_generated/dataModel';
import { cn } from '@/lib/utils';

interface TripFiltersProps {
  vehicleId: Id<"vehicles"> | undefined;
  driverId: Id<"drivers"> | undefined;
  studentSearch: string;
  onVehicleChange: (vehicleId: Id<"vehicles"> | undefined) => void;
  onDriverChange: (driverId: Id<"drivers"> | undefined) => void;
  onStudentSearchChange: (search: string) => void;
  onClearFilters: () => void;
}

export function TripFilters({
  vehicleId,
  driverId,
  studentSearch,
  onVehicleChange,
  onDriverChange,
  onStudentSearchChange,
  onClearFilters,
}: TripFiltersProps) {
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();

  const hasFilters = vehicleId || driverId || studentSearch;

  // Sort vehicles by plate
  const sortedVehicles = useMemo(() => {
    return [...vehicles].sort((a, b) => a.licensePlate.localeCompare(b.licensePlate));
  }, [vehicles]);

  // Sort drivers by name
  const sortedDrivers = useMemo(() => {
    return [...drivers].sort((a, b) => (a.user?.name || '').localeCompare(b.user?.name || ''));
  }, [drivers]);

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 text-gray-500">
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Filtros:</span>
      </div>

      {/* Vehicle filter */}
      <div className="relative">
        <select
          value={vehicleId || ''}
          onChange={(e) => onVehicleChange(e.target.value ? e.target.value as Id<"vehicles"> : undefined)}
          className={cn(
            'pl-3 pr-8 py-2 text-sm border rounded-lg appearance-none bg-white cursor-pointer',
            'focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none',
            vehicleId ? 'border-primary text-primary' : 'border-gray-300 text-gray-700'
          )}
        >
          <option value="">Todos los vehiculos</option>
          {sortedVehicles.map((vehicle) => (
            <option key={vehicle._id} value={vehicle._id}>
              {vehicle.licensePlate} - {vehicle.brand}
            </option>
          ))}
        </select>
      </div>

      {/* Driver filter */}
      <div className="relative">
        <select
          value={driverId || ''}
          onChange={(e) => onDriverChange(e.target.value ? e.target.value as Id<"drivers"> : undefined)}
          className={cn(
            'pl-3 pr-8 py-2 text-sm border rounded-lg appearance-none bg-white cursor-pointer',
            'focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none',
            driverId ? 'border-primary text-primary' : 'border-gray-300 text-gray-700'
          )}
        >
          <option value="">Todos los conductores</option>
          {sortedDrivers.map((driver) => (
            <option key={driver._id} value={driver._id}>
              {driver.user?.name || 'Sin nombre'}
            </option>
          ))}
        </select>
      </div>

      {/* Student search */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={studentSearch}
          onChange={(e) => onStudentSearchChange(e.target.value)}
          placeholder="Buscar estudiante..."
          className={cn(
            'w-full pl-9 pr-8 py-2 text-sm border rounded-lg',
            'focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none',
            studentSearch ? 'border-primary' : 'border-gray-300'
          )}
        />
        {studentSearch && (
          <button
            onClick={() => onStudentSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Clear all button */}
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
