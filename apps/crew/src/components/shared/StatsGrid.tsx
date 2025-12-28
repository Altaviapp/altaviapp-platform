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
  columns?: 2 | 3 | 4;
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
  3: 'grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

export function StatsGrid({
  stats,
  isLoading = false,
  columns = 2,
  className,
}: StatsGridProps) {
  if (isLoading) {
    return (
      <div className={cn('grid gap-3', columnStyles[columns], className)}>
        {Array.from({ length: stats.length || 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-3 animate-pulse"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-200" />
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-12 mb-1.5" />
                <div className="h-5 bg-gray-200 rounded w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-3', columnStyles[columns], className)}>
      {stats.map((stat, index) => {
        const color = stat.color || 'default';
        const styles = colorStyles[color];
        const Icon = stat.icon;

        return (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-3"
          >
            <div className="flex items-center gap-2">
              {Icon && (
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    styles.icon
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 truncate">{stat.label}</p>
                <div className="flex items-baseline gap-1">
                  <p className={cn('text-lg font-bold', styles.value)}>
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
