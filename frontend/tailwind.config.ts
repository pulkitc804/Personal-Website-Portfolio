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
        // Two-tone tournament court. See DESIGN.md.
        court: "#0e4f4c",
        "court-deep": "#07211f",
        clay: "#cc5b38",
        chalk: "#f2eee2",
        "chalk-dim": "#e4ddca",
        ink: "#10211f",
        "ink-soft": "#37524e",
        ball: "#c8f135",
      },
      fontFamily: {
        display: ["var(--font-archivo)", "system-ui", "sans-serif"],
        sans: ["var(--font-archivo)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      keyframes: {
        "serve-arc": {
          "0%": { transform: "translate(-44%, 18%) scale(0.7)", opacity: "0" },
          "30%": { opacity: "1" },
          "55%": { transform: "translate(0, -32%) scale(1.05)" },
          "100%": { transform: "translate(0,0) scale(1)" },
        },
        "ball-idle": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "serve-arc": "serve-arc 1.4s cubic-bezier(0.22,1,0.36,1) both",
        "ball-idle": "ball-idle 3.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
