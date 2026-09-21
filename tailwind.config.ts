import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.ts",
    "./config/**/*.ts",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        base: "var(--bg)",
        "base-2": "var(--bg-2)",
        ink: "var(--text)",
        "ink-muted": "var(--text-muted)",
        cyan: {
          DEFAULT: "#22D3EE",
          soft: "rgba(34, 211, 238, 0.14)",
        },
        blue: {
          DEFAULT: "#3B82F6",
          soft: "rgba(59, 130, 246, 0.14)",
        },
        glass: {
          DEFAULT: "var(--glass-bg)",
          border: "var(--glass-border)",
          highlight: "var(--glass-highlight)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "Segoe UI", "Arial", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "28px",
        "card-sm": "20px",
      },
      maxWidth: {
        content: "1360px",
      },
      boxShadow: {
        glass: "0 24px 60px -24px rgba(2, 8, 20, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
        "glass-lg": "0 40px 90px -30px rgba(2, 8, 20, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
        glow: "0 0 0 1px rgba(34, 211, 238, 0.25), 0 12px 40px -12px rgba(34, 211, 238, 0.35)",
      },
      backdropBlur: {
        glass: "24px",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
