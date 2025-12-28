'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatItem {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export interface StatsGridProps {
  stats: StatItem[];
  isLoading?: boolean;
  columns?: 2 | 3 | 4 | 6;
  className?: string;
}

const colorStyles = {
  default: {
    bg: 'bg-gray-50',
    icon: 'text-gray-600 bg-gray-100',
    value: 'text-gray-900',
  },
  success: {
    bg: 'bg-green-50',
    icon: 'text-green-600 bg-green-100',
    value: 'text-green-700',
  },
  warning: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600 bg-yellow-100',
    value: 'text-yellow-700',
  },
  danger: {
    bg: 'bg-red-50',
    icon: 'text-red-600 bg-red-100',
    value: 'text-red-700',
  },
  info: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600 bg-blue-100',
    value: 'text-blue-700',
  },
};

const columnStyles = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
};

export function StatsGrid({
  stats,
  isLoading = false,
  columns = 4,
  className,
}: StatsGridProps) {
  if (isLoading) {
    return (
      <div className={cn('grid gap-4', columnStyles[columns], className)}>
        {Array.from({ length: stats.length || 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-16 mb-2" />
                <div className="h-6 bg-gray-200 rounded w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4', columnStyles[columns], className)}>
      {stats.map((stat, index) => {
        const color = stat.color || 'default';
        const styles = colorStyles[color];
        const Icon = stat.icon;

        return (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center gap-3">
              {Icon && (
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    styles.icon
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 truncate">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className={cn('text-2xl font-bold', styles.value)}>
                    {stat.value}
                  </p>
                  {stat.trend && (
                    <span
                      className={cn(
                        'text-xs font-medium',
                        stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {stat.trend.isPositive ? '+' : ''}
                      {stat.trend.value}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
