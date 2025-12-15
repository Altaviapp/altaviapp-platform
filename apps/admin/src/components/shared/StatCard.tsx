import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  subValue?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

const colorClasses = {
  primary: 'bg-primary',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

/**
 * StatCard Component
 *
 * Based on ADMIN_WIREFRAMES.md dashboard metrics cards:
 * - Icon with colored background
 * - Main value prominently displayed
 * - Label and optional sub-value
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color = 'primary',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
            colorClasses[color]
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 truncate">{label}</p>
          {subValue && (
            <p className="text-xs text-gray-400">{subValue}</p>
          )}
        </div>
      </div>
    </div>
  );
}
