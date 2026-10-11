/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // SURGE Semantic Tokens
        action: {
          primary: "var(--color-action-primary)",
          hover: "var(--color-action-hover)",
          active: "var(--color-action-active)",
        },
        status: {
          safe: "var(--color-status-safe)",
          warning: "var(--color-status-warning)",
          critical: "var(--color-status-critical)",
          severe: "var(--color-status-severe)",
        },
        verified: "var(--color-verified)",
        trust: "var(--color-trust)",
        selection: {
          active: "var(--color-selection-active)",
        },
        telemetry: {
          live: "var(--color-live-data)",
          fallback: "var(--color-fallback-data)",
        },

        // Surface Scales (Light & Dark Paired)
        surface: {
          base: "var(--surface-base)",
          card: "var(--surface-card)",
          elevated: "var(--surface-elevated)",
          overlay: "var(--surface-overlay)",
        },

        // WCAG AA Text Contrast Scale
        txt: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
        },

        // Legacy compatibility mappings
        brand: {
          blue: "#2e7dd1",
          "blue-dark": "#2563eb",
          orange: "#ea580c",
          "orange-dark": "#c2410c",
          green: "#16a34a",
          "green-dark": "#15803d",
        },
        space: {
          950: "#0b101d",
          900: "#131b2e",
          850: "#1c263e",
          800: "#253350",
        },
        // ── "Mist" single-theme neutral scale ─────────────────────────────────
        // Driven by the RGB variables in globals.css (:root) so the whole site's
        // tone can be tuned in one place. `slate` and `gray` share one scale.
        slate: {
          50:  "rgb(var(--slate-50) / <alpha-value>)",
          100: "rgb(var(--slate-100) / <alpha-value>)",
          200: "rgb(var(--slate-200) / <alpha-value>)",
          300: "rgb(var(--slate-300) / <alpha-value>)",
          400: "rgb(var(--slate-400) / <alpha-value>)",
          500: "rgb(var(--slate-500) / <alpha-value>)",
          600: "rgb(var(--slate-600) / <alpha-value>)",
          700: "rgb(var(--slate-700) / <alpha-value>)",
          800: "rgb(var(--slate-800) / <alpha-value>)",
          900: "rgb(var(--slate-900) / <alpha-value>)",
          950: "rgb(var(--slate-950) / <alpha-value>)",
        },
        gray: {
          50:  "rgb(var(--slate-50) / <alpha-value>)",
          100: "rgb(var(--slate-100) / <alpha-value>)",
          200: "rgb(var(--slate-200) / <alpha-value>)",
          300: "rgb(var(--slate-300) / <alpha-value>)",
          400: "rgb(var(--slate-400) / <alpha-value>)",
          500: "rgb(var(--slate-500) / <alpha-value>)",
          600: "rgb(var(--slate-600) / <alpha-value>)",
          700: "rgb(var(--slate-700) / <alpha-value>)",
          800: "rgb(var(--slate-800) / <alpha-value>)",
          850: "rgb(var(--slate-800) / <alpha-value>)",
          900: "rgb(var(--slate-900) / <alpha-value>)",
          925: "rgb(var(--slate-900) / <alpha-value>)",
          950: "rgb(var(--slate-950) / <alpha-value>)",
        },
      },
      // Only the *surface* use of white is tinted (bg-white → soft card tone).
      // text-white / border-white stay pure white so text on buttons is unaffected.
      backgroundColor: {
        white: "rgb(var(--card-rgb) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["'Nunito'", "'Quicksand'", "'Lexend'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        logo: ["'Nunito'", "'Quicksand'", "'Lexend'", "sans-serif"],
        brand: ["'Nunito'", "'Quicksand'", "'Lexend'", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        '2xs': ['11px', '16px'],
        'xs':  ['12px', '18px'],
        'sm':  ['13px', '20px'],
        'base':['14px', '22px'],
        'lg':  ['16px', '24px'],
        'xl':  ['18px', '26px'],
        '2xl': ['20px', '28px'],
        '3xl': ['24px', '32px'],
        '4xl': ['30px', '38px'],
        '5xl': ['36px', '44px'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      keyframes: {
        // Opacity-only on purpose: several elements combine this with inline/utility
        // transforms for positioning (e.g. translateX(-50%)), which a transform
        // keyframe would override.
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
        'action': '0 4px 20px rgba(37,99,235,0.25)',
        'severe': '0 4px 20px rgba(220,38,38,0.25)',
        'safe': '0 4px 20px rgba(22,163,74,0.25)',
      },
    },
  },
  plugins: [],
};
