import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface DetailItemProps {
  label: string;
  value: ReactNode;
  className?: string;
}

interface DetailSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

/**
 * DetailItem Component
 *
 * Single label-value pair for detail views.
 */
export function DetailItem({ label, value, className }: DetailItemProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{value ?? '-'}</dd>
    </div>
  );
}

/**
 * DetailGrid Component
 *
 * Grid layout for multiple DetailItems.
 */
export function DetailGrid({
  children,
  cols = 2,
}: {
  children: ReactNode;
  cols?: 2 | 3 | 4;
}) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <dl className={cn('grid gap-4', gridCols[cols])}>
      {children}
    </dl>
  );
}

/**
 * DetailSection Component
 *
 * Grouped section in detail pages with title and content.
 * Based on ADMIN_WIREFRAMES.md detail page patterns.
 */
export function DetailSection({
  title,
  children,
  className,
  actions,
}: DetailSectionProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-100',
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {actions}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
