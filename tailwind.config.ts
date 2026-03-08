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
        terminal: {
          bg: "var(--terminal-bg)",
          panel: "var(--terminal-panel)",
          line: "var(--terminal-line)",
          text: "var(--terminal-text)",
          muted: "var(--terminal-muted)",
          accent: "var(--terminal-accent)",
          warning: "var(--terminal-warning)",
        },
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(28, 40, 54, 0.85), 0 18px 60px rgba(0, 0, 0, 0.45)",
      },
      keyframes: {
        reveal: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        reveal: "reveal .55s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
