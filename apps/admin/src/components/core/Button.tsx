'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, LucideIcon } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  children: ReactNode;
}

const variantStyles = {
  primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/50',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-200',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200',
  link: 'bg-transparent text-primary hover:underline p-0 h-auto',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
          variantStyles[variant],
          variant !== 'link' && sizeStyles[size],
          isDisabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          LeftIcon && <LeftIcon className="w-4 h-4" />
        )}
        {children}
        {!isLoading && RightIcon && <RightIcon className="w-4 h-4" />}
      </button>
    );
  }
);

Button.displayName = 'Button';
