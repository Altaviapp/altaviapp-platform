'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { Button } from '@/components/core';

interface ActionButton {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  actions?: ActionButton[];
  badge?: ReactNode;
  className?: string;
}

/**
 * PageHeader Component (Mobile-optimized)
 *
 * Standard page header with back button, title, and action buttons.
 * Simplified for mobile PWA use - no breadcrumbs.
 */
export function PageHeader({
  title,
  subtitle,
  backHref,
  actions = [],
  badge,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className={cn('mb-4', className)}>
      {/* Title Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          {/* Back Button */}
          {backHref !== undefined && (
            <button
              onClick={handleBack}
              className="mt-0.5 p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 truncate">{title}</h1>
              {badge}
            </div>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {actions.length > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions.map((action, index) => {
              const Icon = action.icon;

              if (action.href && !action.disabled) {
                return (
                  <Button
                    key={index}
                    variant={action.variant || 'secondary'}
                    size="sm"
                    leftIcon={Icon}
                    onClick={() => router.push(action.href!)}
                    disabled={action.disabled}
                  >
                    {action.label}
                  </Button>
                );
              }

              return (
                <Button
                  key={index}
                  variant={action.variant || 'secondary'}
                  size="sm"
                  leftIcon={Icon}
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
