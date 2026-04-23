import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#030712",
        panel: "#0a0f1e",
        cyan: {
          glow: "#22d3ee",
          dim: "#0891b2",
        },
        violet: {
          glow: "#a78bfa",
          dim: "#6d28d9",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, rgba(2,6,23,0) 0%, rgba(3,7,18,0.85) 55%, #030712 100%), linear-gradient(rgba(34,211,238,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.05) 1px, transparent 1px)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(34, 211, 238, 0.25), 0 0 80px rgba(167, 139, 250, 0.12)",
        card: "0 0 0 1px rgba(148, 163, 184, 0.08), 0 24px 48px -12px rgba(0, 0, 0, 0.65)",
      },
      animation: {
        "pulse-slow": "pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        scan: "scan 8s linear infinite",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
