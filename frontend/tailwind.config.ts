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
        void: "#0a0607",
        panel: "#140d10",
        cyan: {
          glow: "#f87171",
          dim: "#dc2626",
        },
        violet: {
          glow: "#fda4af",
          dim: "#e11d48",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, rgba(10,6,7,0) 0%, rgba(10,6,7,0.78) 55%, #0a0607 100%), linear-gradient(rgba(248,113,113,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(253,164,175,0.07) 1px, transparent 1px)",
      },
      boxShadow: {
        glow: "0 0 48px rgba(248, 113, 113, 0.28), 0 0 96px rgba(253, 164, 175, 0.16)",
        card: "0 0 0 1px rgba(203, 213, 225, 0.12), 0 24px 48px -12px rgba(0, 0, 0, 0.55)",
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
