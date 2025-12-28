'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: {
    container: 'py-8',
    icon: 'w-6 h-6',
    text: 'text-sm',
  },
  md: {
    container: 'py-12',
    icon: 'w-8 h-8',
    text: 'text-base',
  },
  lg: {
    container: 'py-16',
    icon: 'w-10 h-10',
    text: 'text-lg',
  },
};

export function LoadingState({
  message = 'Cargando...',
  size = 'md',
  className,
}: LoadingStateProps) {
  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        styles.container,
        className
      )}
    >
      <Loader2 className={cn('animate-spin text-primary', styles.icon)} />
      {message && (
        <p className={cn('mt-3 text-gray-500', styles.text)}>{message}</p>
      )}
    </div>
  );
}
