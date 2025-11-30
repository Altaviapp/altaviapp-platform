import type { Config } from 'tailwindcss';
import path from 'path';

const config = {
  darkMode: ['class'],
  content: [
    path.join(__dirname, './mobile/pages/**/*.{ts,tsx}'),
    path.join(__dirname, './mobile/components/**/*.{ts,tsx}'),
    path.join(__dirname, './mobile/app/**/*.{ts,tsx}'),
    path.join(__dirname, './mobile/src/**/*.{ts,tsx}'),
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Brand Colors - Altaviapp
        primary: {
          DEFAULT: '#042940',
          50: '#E6F0F5',
          100: '#CCE1EB',
          200: '#99C3D7',
          300: '#66A5C3',
          400: '#3387AF',
          500: '#042940', // Base
          600: '#032133',
          700: '#021926',
          800: '#02101A',
          900: '#01080D',
          foreground: '#F7FCFF', // white
        },
        accent: {
          DEFAULT: '#DBF227',
          50: '#FEFEF3',
          100: '#FDFDE7',
          200: '#FAFBCF',
          300: '#F7F9B7',
          400: '#F4F79F',
          500: '#DBF227', // Base
          600: '#C4D917',
          700: '#9CAF12',
          800: '#74840E',
          900: '#4C5909',
          foreground: '#042940', // primary-900
        },
        white: {
          DEFAULT: '#F7FCFF',
          pure: '#FFFFFF',
        },

        // Functional Colors
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#047857',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
          dark: '#1E40AF',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#D97706',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark: '#DC2626',
        },

        // shadcn/ui compatibility (removed - causing conflicts)
        // border: 'hsl(var(--border))',
        // input: 'hsl(var(--input))',
        // ring: 'hsl(var(--ring))',
        // background: 'hsl(var(--background))',
        // foreground: 'hsl(var(--foreground))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: '0.75rem',     // 12px
        sm: '0.875rem',    // 14px
        base: '1rem',      // 16px
        lg: '1.125rem',    // 18px
        xl: '1.25rem',     // 20px
        '2xl': '1.5rem',   // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem',  // 36px
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-from-bottom': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-in-from-top': {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-in',
        'slide-in-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'slide-in-top': 'slide-in-from-top 0.3s ease-out',
      },
    },
  },
  plugins: [
    // tailwindcss-animate commented out - animations defined manually above
    // require('tailwindcss-animate')
  ],
} satisfies Config;

export default config;
