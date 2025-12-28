/**
 * @altaviapp/ui
 *
 * Shared UI component library for Altaviapp PWA applications.
 * Built with shadcn/ui, Radix UI, and Tailwind CSS.
 */

// Utilities
export { cn } from './lib/utils';

// Components
export { Button, buttonVariants, type ButtonProps } from './components/button';
export {
  PhoneInput,
  COUNTRIES,
  getCountryByCode,
  getCountryFromPhone,
  type PhoneInputProps,
  type CountryCode,
} from './components/phone-input';
export {
  LocationSelector,
  DEPARTMENTS,
  CITIES,
  type LocationSelectorProps,
  type LocationValue,
} from './components/location-selector';
