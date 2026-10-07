import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Saira", "hkgrotesk", "Poppins", "system-ui", "sans-serif"],
        heading: ["Saira", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": "0.6875rem", // 11px
        xs: "0.8125rem",    // 13px (Velzon standard)
        sm: "0.875rem",     // 14px
        base: "0.9375rem",  // 15px
      },
      colors: {
        // Calm Forest Teal Primary Palette (#0a7a55 light / #28a77b dark)
        primary: {
          50: "#edf7f3",
          100: "#d5eee3",
          200: "#afddcb",
          300: "#7fc4aa",
          400: "#28a77b", // Calm Dark Mode Accent (WCAG AA compliant)
          500: "#0a7a55", // Base Light Mode Primary (5.37:1 contrast on white)
          600: "#086948", // Hover state
          700: "#06573c", // Active state
          800: "#054530",
          900: "#043525",
          950: "#022016",
          DEFAULT: "#0a7a55",
        },

        // Companion accents (charts, secondary highlights)
        accent: {
          blue: "#2563eb",
          violet: "#7c3aed",
          pink: "#db2777",
          amber: "#d97706",
        },

        // Semantic colors (Distinct hue from primary teal)
        success: "#16a34a",
        warning: "#d97706",
        danger: "#e11d48",
        info: "#0284c7",

        // Layered Dark Palette (Subtle teal-slate undertone, 4 levels)
        galaxy: {
          body: "#0b1319",          // Level 1: Page background
          card: "#111c24",          // Level 2: Surface cards & panels
          header: "#111c24",        // Level 2: Navbar / Topbar
          sidebar: "#111c24",       // Level 2: Vertical menu
          border: "#20323f",        // Level 4: Soft divider / border
          borderSubtle: "#172530",  // Inner subtle borders
          input: "#15232d",         // Level 3: Form inputs & search
          hover: "#1a2c3a",         // Level 3: Hover states
          thead: "#14222c",         // Level 3: Table header background
          menuTitle: "#6c7f8e",     // Subtle uppercase headers
          menuItem: "#9cb0be",      // Menu item text (7.3:1 contrast)
          text: "#d2dce3",          // Primary body text (12.1:1 contrast)
          muted: "#8597a4",         // Secondary text (5.7:1 contrast)
        },
      },
      borderRadius: {
        DEFAULT: "0.25rem", // Velzon 4px standard radius
      },
      boxShadow: {
        galaxy: "0 1px 3px rgba(11, 19, 25, 0.3)",
        "galaxy-cyan": "0 1px 2px rgba(0, 0, 0, 0.08)",
        "galaxy-glow": "0 0 12px -2px rgba(40, 167, 123, 0.2)",
        "galaxy-glow-lg": "0 0 24px -4px rgba(40, 167, 123, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;