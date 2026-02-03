import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // === POLICE THEME COLORS ===

        // Primary Backgrounds (Dark Navy/Graphite)
        'police-dark': {
          900: '#0a0f1a',  // Deepest - Main background
          800: '#151c28',  // Secondary background
          700: '#1a2332',  // Cards/Panels
          600: '#1e2836',  // Elevated elements (Navbar, Modals)
        },

        // Gold Badge Accent (Primary Action Color)
        'badge-gold': {
          400: '#fbbf24',  // Light gold
          500: '#f59e0b',  // Medium gold
          600: '#d4af37',  // Classic badge gold
          700: '#b8960f',  // Dark gold
        },

        // Police Blue (Secondary Action)
        'police-blue': {
          400: '#60a5fa',  // Light blue
          500: '#3b82f6',  // Medium blue
          600: '#2563eb',  // Deep blue
          700: '#1e40af',  // Navy blue
        },

        // Silver Badge (Alternative Accent)
        'badge-silver': {
          400: '#cbd5e1',  // Light silver
          500: '#94a3b8',  // Medium silver
          600: '#64748b',  // Dark silver
        },

        // Status Colors (Enhanced for Police Theme)
        'police-status': {
          success: '#10b981',   // Green - Approved/Passed
          warning: '#f59e0b',   // Amber - Caution
          danger: '#ef4444',    // Red - Alert/Failed
          info: '#3b82f6',      // Blue - Information
        },

        // Keep existing background/foreground for compatibility
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },

      fontFamily: {
        // === TYPOGRAPHY ===
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'sans-serif'], // For headers
      },

      backgroundImage: {
        // === POLICE GRADIENTS ===
        'badge-gold-gradient': 'linear-gradient(135deg, #d4af37 0%, #fbbf24 100%)',
        'badge-silver-gradient': 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)',
        'police-blue-gradient': 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        'police-dark-gradient': 'linear-gradient(135deg, #0a0f1a 0%, #151c28 50%, #1a2332 100%)',
      },

      boxShadow: {
        // === CUSTOM SHADOWS ===
        'badge-gold': '0 10px 40px -10px rgba(212, 175, 55, 0.5)',
        'police-glow': '0 0 30px rgba(59, 130, 246, 0.3)',
        'gold-glow': '0 0 30px rgba(251, 191, 36, 0.3)',
      },

      animation: {
        // === CUSTOM ANIMATIONS ===
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideDown': 'slideDown 0.2s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
