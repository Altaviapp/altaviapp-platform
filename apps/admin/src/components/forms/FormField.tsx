import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type InputType = 'text' | 'email' | 'tel' | 'number' | 'date' | 'time' | 'password' | 'textarea' | 'select';

interface FormFieldProps {
  label: string;
  name: string;
  type?: InputType;
  value?: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  options?: { value: string; label: string }[];
  className?: string;
  children?: ReactNode;
}

/**
 * FormField Component
 *
 * Reusable form field with label, validation, and error display.
 * Based on ADMIN_WIREFRAMES.md input patterns.
 */
export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  hint,
  options = [],
  className,
  children,
}: FormFieldProps) {
  const inputClasses = cn(
    'w-full px-3 py-2 border rounded-lg text-sm transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
    error
      ? 'border-red-300 bg-red-50'
      : 'border-gray-300 bg-white hover:border-gray-400',
    disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
    className
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    onChange?.(e.target.value);
  };

  const renderInput = () => {
    if (children) {
      return children;
    }

    if (type === 'textarea') {
      return (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={4}
          className={inputClasses}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={inputClasses}
        >
          <option value="">{placeholder ?? 'Seleccionar...'}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClasses}
      />
    );
  };

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

/**
 * FormFieldRow Component
 *
 * Helper to display multiple fields in a row.
 */
export function FormFieldRow({
  children,
  cols = 2,
}: {
  children: ReactNode;
  cols?: 2 | 3 | 4;
}) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[cols])}>
      {children}
    </div>
  );
}
