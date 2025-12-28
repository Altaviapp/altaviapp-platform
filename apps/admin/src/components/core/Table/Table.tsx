'use client';

import { ReactNode, forwardRef, HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table
          ref={ref}
          className={cn('min-w-full divide-y divide-gray-200', className)}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <thead ref={ref} className={cn('bg-gray-50', className)} {...props}>
        {children}
      </thead>
    );
  }
);

TableHeader.displayName = 'TableHeader';

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={cn('divide-y divide-gray-200 bg-white', className)}
        {...props}
      >
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = 'TableBody';

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  clickable?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, clickable, className, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          clickable && 'hover:bg-gray-50 cursor-pointer transition-colors',
          className
        )}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

TableRow.displayName = 'TableRow';

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
          className
        )}
        {...props}
      >
        {children}
      </th>
    );
  }
);

TableHead.displayName = 'TableHead';

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn('px-4 py-3 text-sm text-gray-900', className)}
        {...props}
      >
        {children}
      </td>
    );
  }
);

TableCell.displayName = 'TableCell';
