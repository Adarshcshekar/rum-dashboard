/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        sans: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        surface: {
          0: "#0a0b0d",
          1: "#0f1114",
          2: "#141720",
          3: "#1c2030",
          4: "#252a38",
        },
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        emerald: { 400: "#34d399", 500: "#10b981" },
        rose:    { 400: "#fb7185", 500: "#f43f5e" },
        sky:     { 400: "#38bdf8", 500: "#0ea5e9" },
        muted:   "#4b5563",
        border:  "#1e2433",
      },
      animation: {
        "fade-up":   "fadeUp 0.4s ease forwards",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
        "scan-line": "scanLine 3s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%":      { opacity: 0.4, transform: "scale(0.8)" },
        },
        scanLine: {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
    },
  },
  plugins: [],
};
