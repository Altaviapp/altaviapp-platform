'use client';

import { ReactNode, forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, padding = 'md', hover = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-lg border border-gray-200 shadow-sm',
          paddingStyles[padding],
          hover && 'transition-shadow hover:shadow-md cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function CardHeader({ title, subtitle, action, children, className, ...props }: CardHeaderProps) {
  if (children) {
    return (
      <div
        className={cn('flex items-start justify-between gap-4 mb-4', className)}
        {...props}
      >
        <div className="flex-1">{children}</div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    );
  }

  return (
    <div
      className={cn('flex items-start justify-between gap-4 mb-4', className)}
      {...props}
    >
      <div>
        {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        'mt-4 pt-4 border-t border-gray-100 flex items-center justify-end gap-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
