/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0D0101',
        primary: {
          DEFAULT: '#FF5D00',
          hover: '#FF7324',
          glow: 'rgba(255, 93, 0, 0.35)',
        },
        surface: {
          DEFAULT: 'rgba(22, 12, 12, 0.7)',
          card: 'rgba(18, 10, 10, 0.65)',
          elevated: 'rgba(28, 16, 16, 0.85)',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-highlight': 'rgba(255, 93, 0, 0.35)',
        },
        accent: {
          orange: '#FF5D00',
          purple: '#9333EA',
          blue: '#3B82F6',
          cyan: '#06B6D4',
        },
        text: {
          primary: '#FFFAFA',
          secondary: '#A19999',
          muted: '#6B6363',
        },
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass-sm': '0 4px 24px -1px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        'glass-lg': '0 16px 48px 0 rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.12)',
        'glow-orange': '0 0 25px rgba(255, 93, 0, 0.3)',
        'glow-orange-lg': '0 0 50px rgba(255, 93, 0, 0.45)',
        'glow-purple': '0 0 25px rgba(147, 51, 234, 0.25)',
        'glow-blue': '0 0 25px rgba(59, 130, 246, 0.25)',
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-border': 'gradient-border 6s ease infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'gradient-border': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};

