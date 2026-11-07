/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Inter', 'system-ui', 'sans-serif'],
        kanit: ['"Kanit"', 'sans-serif'],
        bebas: ['"Bebas Neue"', 'sans-serif'],
        space: ['"Space Grotesk"', 'sans-serif'],
      },
      fontSize: {
        // Phi-scaled typography (1.618 ratio)
        'hero': ['76px', { lineHeight: '1', fontWeight: '600' }],
        'hero-md': ['47px', { lineHeight: '1.05', fontWeight: '600' }],
        'hero-sm': ['29px', { lineHeight: '1.1', fontWeight: '600' }],
        
        'display': ['280px', { lineHeight: '1', fontWeight: '600' }],
        'display-md': ['173px', { lineHeight: '1', fontWeight: '600' }],
        'display-sm': ['100px', { lineHeight: '1', fontWeight: '600' }],
        
        'heading': ['42px', { lineHeight: '1.24', fontWeight: '600' }],
        'heading-md': ['32px', { lineHeight: '1.25', fontWeight: '600' }],
        'heading-sm': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        
        'subheading': ['32px', { lineHeight: '1.19', fontWeight: '500' }],
        'subheading-md': ['24px', { lineHeight: '1.25', fontWeight: '500' }],
        'subheading-sm': ['20px', { lineHeight: '1.3', fontWeight: '500' }],
        
        'body': ['28px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-md': ['22px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-sm': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        
        'small': ['14px', { lineHeight: '1.5', fontWeight: '500' }],
        'small-sm': ['12px', { lineHeight: '1.5', fontWeight: '500' }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          muted: "hsl(var(--accent-muted))",
          border: "hsl(var(--accent-border))",
          hover: "hsl(var(--accent-hover))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        navy: {
          950: '#0a1219',
          900: '#0d1720',
          800: '#111d28',
          700: '#182736',
          border: '#263440',
        },
        canvas: '#f8f8f6',
        hairline: '#dedfdb',
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        terracotta: {
          DEFAULT: "hsl(var(--terracotta, 18 50% 55%))",
          light: "hsl(var(--terracotta-light, 18 50% 65%))",
        },
        cream: "hsl(var(--warm-cream, 40 33% 97%))",
        taupe: "hsl(var(--warm-taupe, 30 15% 85%))",
        charcoal: "hsl(var(--charcoal, 30 10% 15%))",
        linen: "hsl(var(--linen, 35 25% 94%))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-out-right": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        "ken-burns": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.08)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.7s ease-out forwards",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-out-right": "slide-out-right 0.3s ease-out",
        "ken-burns": "ken-burns 20s ease-out infinite alternate",
        marquee: "marquee 25s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
