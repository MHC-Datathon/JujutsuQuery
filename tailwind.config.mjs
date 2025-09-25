/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ClearLane brand colors - data visualization palette
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Main brand blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Success/positive data green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16'
        },
        accent: {
          50: '#fef3c7',
          100: '#fef08a',
          200: '#fde047',
          300: '#facc15',
          400: '#eab308', // Warning/attention yellow
          500: '#ca8a04',
          600: '#a16207',
          700: '#854d0e',
          800: '#713f12',
          900: '#5a2a08'
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // Error/negative data red
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a'
        },
        // Data visualization specific colors
        violation: {
          light: '#fca5a5',
          main: '#ef4444',
          dark: '#dc2626'
        },
        enforcement: {
          light: '#86efac',
          main: '#22c55e',
          dark: '#16a34a'
        },
        cuny: {
          light: '#93c5fd',
          main: '#3b82f6',
          dark: '#1d4ed8'
        },
        // Neutral grays for text and backgrounds
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Monaco', 'monospace'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.neutral.700'),
            maxWidth: 'none',
            h1: {
              color: theme('colors.neutral.900'),
            },
            h2: {
              color: theme('colors.neutral.900'),
            },
            h3: {
              color: theme('colors.neutral.800'),
            },
            h4: {
              color: theme('colors.neutral.800'),
            },
            'h2, h3, h4': {
              'scroll-margin-top': '6rem',
            },
            code: {
              color: theme('colors.primary.600'),
              backgroundColor: theme('colors.neutral.100'),
              padding: '0.25rem 0.375rem',
              borderRadius: '0.25rem',
              fontWeight: '600',
            },
            'code::before': {
              content: 'none',
            },
            'code::after': {
              content: 'none',
            },
            pre: {
              backgroundColor: theme('colors.neutral.900'),
              color: theme('colors.neutral.100'),
            },
            'pre code': {
              backgroundColor: 'transparent',
              color: 'inherit',
            },
            a: {
              color: theme('colors.primary.600'),
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': {
                color: theme('colors.primary.800'),
                textDecoration: 'underline',
              },
            },
            blockquote: {
              borderLeftColor: theme('colors.primary.500'),
              backgroundColor: theme('colors.primary.50'),
              padding: '1rem',
              borderRadius: '0.5rem',
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.neutral.300'),
            h1: {
              color: theme('colors.neutral.100'),
            },
            h2: {
              color: theme('colors.neutral.100'),
            },
            h3: {
              color: theme('colors.neutral.200'),
            },
            h4: {
              color: theme('colors.neutral.200'),
            },
            code: {
              color: theme('colors.primary.400'),
              backgroundColor: theme('colors.neutral.800'),
            },
            a: {
              color: theme('colors.primary.400'),
              '&:hover': {
                color: theme('colors.primary.300'),
              },
            },
            blockquote: {
              borderLeftColor: theme('colors.primary.400'),
              backgroundColor: theme('colors.neutral.800'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};