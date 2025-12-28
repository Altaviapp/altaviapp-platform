'use client';

import { useState, useCallback, ChangeEvent } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/core';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  value?: string;
}

export interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  onFilterChange?: (key: string, value: string) => void;
  className?: string;
}

export function SearchFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters = [],
  onFilterChange,
  className,
}: SearchFilterProps) {
  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange]
  );

  const handleClearSearch = useCallback(() => {
    onSearchChange('');
  }, [onSearchChange]);

  return (
    <div className={cn('flex flex-col sm:flex-row gap-3', className)}>
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Input
          type="text"
          value={searchValue}
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
          leftIcon={Search}
          rightElement={
            searchValue ? (
              <button
                onClick={handleClearSearch}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            ) : undefined
          }
        />
      </div>

      {/* Filters */}
      {filters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((filter) => (
            <div key={filter.key} className="relative">
              <select
                value={filter.value || ''}
                onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                className={cn(
                  'appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-300 bg-white',
                  'focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none',
                  'cursor-pointer'
                )}
              >
                <option value="">{filter.label}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
