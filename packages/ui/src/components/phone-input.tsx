'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export type CountryCode = 'EC' | 'CO';

interface Country {
  code: CountryCode;
  name: string;
  phoneCode: string;
  phoneDigits: number;
  flag: string;
}

export interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  defaultCountry?: CountryCode;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  autoDetectCountry?: boolean;
}

// ============================================================================
// DATA
// ============================================================================

const COUNTRIES: Country[] = [
  {
    code: 'EC',
    name: 'Ecuador',
    phoneCode: '+593',
    phoneDigits: 9,
    flag: '🇪🇨',
  },
  {
    code: 'CO',
    name: 'Colombia',
    phoneCode: '+57',
    phoneDigits: 10,
    flag: '🇨🇴',
  },
];

// ============================================================================
// UTILITIES
// ============================================================================

const getCountryByCode = (code: CountryCode): Country => {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0]!;
};

const getCountryFromPhone = (phone: string): CountryCode | null => {
  if (phone.startsWith('+593')) return 'EC';
  if (phone.startsWith('+57')) return 'CO';
  return null;
};

const detectCountryFromIP = async (): Promise<CountryCode> => {
  try {
    const response = await fetch('https://ipapi.co/country/', {
      signal: AbortSignal.timeout(3000),
    });
    const countryCode = await response.text();
    return countryCode === 'CO' ? 'CO' : 'EC';
  } catch {
    return 'EC';
  }
};

const formatPhoneNumber = (digits: string, country: Country): string => {
  if (country.code === 'EC') {
    // Ecuador: 99 123 4567
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`;
  } else {
    // Colombia: 310 123 4567
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  }
};

// ============================================================================
// COMPONENT
// ============================================================================

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value,
      onChange,
      defaultCountry = 'EC',
      error,
      disabled = false,
      placeholder,
      className,
      id,
      name,
      required,
      autoDetectCountry = true,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedCountry, setSelectedCountry] = React.useState<Country>(() => {
      // If value exists, try to detect country from it
      const existingCountry = value ? getCountryFromPhone(value) : null;
      return existingCountry
        ? getCountryByCode(existingCountry)
        : getCountryByCode(defaultCountry);
    });
    const [digits, setDigits] = React.useState(() => {
      // Extract digits from existing value
      if (value) {
        const country = getCountryFromPhone(value);
        if (country) {
          const phoneCode = getCountryByCode(country).phoneCode;
          return value.slice(phoneCode.length);
        }
      }
      return '';
    });

    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Auto-detect country on mount
    React.useEffect(() => {
      if (autoDetectCountry && !value) {
        detectCountryFromIP().then((code) => {
          setSelectedCountry(getCountryByCode(code));
        });
      }
    }, [autoDetectCountry, value]);

    // Close dropdown on outside click
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update parent value when digits or country changes
    React.useEffect(() => {
      const fullNumber = digits ? `${selectedCountry.phoneCode}${digits}` : '';
      if (fullNumber !== value) {
        onChange(fullNumber);
      }
    }, [digits, selectedCountry, onChange, value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value.replace(/\D/g, '');
      const maxDigits = selectedCountry.phoneDigits;
      const limitedDigits = inputValue.slice(0, maxDigits);
      setDigits(limitedDigits);
    };

    const handleCountrySelect = (country: Country) => {
      setSelectedCountry(country);
      // Trim digits if new country requires fewer
      if (digits.length > country.phoneDigits) {
        setDigits(digits.slice(0, country.phoneDigits));
      }
      setIsOpen(false);
    };

    const displayValue = formatPhoneNumber(digits, selectedCountry);

    return (
      <div className={cn('relative', className)}>
        <div
          className={cn(
            'flex items-center border rounded-lg overflow-hidden transition-colors',
            error
              ? 'border-red-500 focus-within:ring-red-500/20'
              : 'border-gray-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-100'
          )}
        >
          {/* Country Selector */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => !disabled && setIsOpen(!isOpen)}
              disabled={disabled}
              className={cn(
                'flex items-center gap-1 px-3 py-2.5 bg-gray-50 border-r border-gray-300 hover:bg-gray-100 transition-colors min-w-[100px]',
                disabled && 'cursor-not-allowed hover:bg-gray-50'
              )}
            >
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm font-medium text-gray-700">
                {selectedCountry.phoneCode}
              </span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-gray-500 transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Dropdown */}
            {isOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors',
                      country.code === selectedCountry.code && 'bg-primary/5'
                    )}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="flex-1 text-sm font-medium text-gray-900">
                      {country.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {country.phoneCode}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phone Input */}
          <input
            ref={ref}
            type="tel"
            inputMode="numeric"
            id={id}
            name={name}
            value={displayValue}
            onChange={handleInputChange}
            disabled={disabled}
            required={required}
            placeholder={
              placeholder ||
              (selectedCountry.code === 'EC' ? '99 123 4567' : '310 123 4567')
            }
            className={cn(
              'flex-1 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent',
              disabled && 'cursor-not-allowed'
            )}
          />
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput, COUNTRIES, getCountryByCode, getCountryFromPhone };
