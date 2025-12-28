'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface Breadcrumb {
  label: string;
  href?: string;
}

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
  breadcrumbs?: Breadcrumb[];
  actions?: ActionButton[];
  backHref?: string;
  badge?: ReactNode;
  className?: string;
}

/**
 * PageHeader Component
 *
 * Standard page header with breadcrumbs, title, and action buttons.
 * Based on ADMIN_WIREFRAMES.md page header patterns.
 */
export function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  actions = [],
  backHref,
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
    <div className={cn('mb-6', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="w-4 h-4" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-gray-700 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Title Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {/* Back Button */}
          {backHref !== undefined && (
            <button
              onClick={handleBack}
              className="mt-1 p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {badge}
            </div>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {actions.length > 0 && (
          <div className="flex items-center gap-2">
            {actions.map((action, index) => {
              const Icon = action.icon;
              const buttonClasses = cn(
                'px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2',
                action.variant === 'primary' &&
                  'bg-primary text-white hover:bg-primary/90',
                action.variant === 'secondary' &&
                  'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
                action.variant === 'danger' &&
                  'bg-red-600 text-white hover:bg-red-700',
                !action.variant &&
                  'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
                action.disabled && 'opacity-50 cursor-not-allowed'
              );

              if (action.href && !action.disabled) {
                return (
                  <Link key={index} href={action.href} className={buttonClasses}>
                    {Icon && <Icon className="w-4 h-4" />}
                    {action.label}
                  </Link>
                );
              }

              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={buttonClasses}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
