'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md';
}

const sizeStyles = {
  sm: {
    track: 'w-8 h-4',
    thumb: 'w-3 h-3',
    translate: 'translate-x-4',
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'w-5 h-5',
    translate: 'translate-x-5',
  },
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, size = 'md', className, id, checked, onChange, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const styles = sizeStyles[size];

    return (
      <label
        htmlFor={switchId}
        className={cn(
          'flex items-start gap-3 cursor-pointer',
          props.disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <div className="relative flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            id={switchId}
            checked={checked}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              'rounded-full bg-gray-200 transition-colors',
              'peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/50 peer-focus:ring-offset-2',
              styles.track
            )}
          />
          <div
            className={cn(
              'absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform',
              'peer-checked:' + styles.translate,
              styles.thumb
            )}
          />
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-gray-900">{label}</span>
            )}
            {description && (
              <span className="text-sm text-gray-500">{description}</span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch';
