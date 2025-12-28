'use client';

import { ReactNode, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TablePagination,
  LoadingState,
  EmptyState,
} from '@/components/core';
import { cn } from '@/lib/utils';
import { LucideIcon, Inbox } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T) => ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  rowHref?: (item: T) => string;
  emptyState?: {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick?: () => void;
      href?: string;
    };
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading = false,
  keyExtractor,
  onRowClick,
  rowHref,
  emptyState = {
    icon: Inbox,
    title: 'Sin datos',
    description: 'No hay datos para mostrar.',
  },
  pagination,
  className,
}: DataTableProps<T>) {
  const router = useRouter();

  const handleRowClick = (item: T) => {
    if (rowHref) {
      router.push(rowHref(item));
    } else if (onRowClick) {
      onRowClick(item);
    }
  };

  const isClickable = Boolean(onRowClick || rowHref);

  if (isLoading) {
    return (
      <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
        <LoadingState message="Cargando datos..." />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
        <EmptyState
          icon={emptyState.icon}
          title={emptyState.title}
          description={emptyState.description}
          action={emptyState.action}
        />
      </div>
    );
  }

  return (
    <div className={cn('', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                style={{ width: column.width }}
                className={cn(
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right'
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={keyExtractor(item)}
              clickable={isClickable}
              onClick={() => isClickable && handleRowClick(item)}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                >
                  {column.render
                    ? column.render(item)
                    : (item[column.key] as ReactNode)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {pagination && pagination.totalPages > 1 && (
        <TablePagination {...pagination} />
      )}
    </div>
  );
}
