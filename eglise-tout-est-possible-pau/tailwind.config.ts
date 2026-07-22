import type { Config } from "tailwindcss";

/**
 * Charte graphique — Église Tout est possible Pau
 *
 * night  #121212 — fond principal sombre
 * cream  #FCFEE9 — fond clair
 * leaf   #A3CD86 — vert principal
 * pulse  #30FF12 — vert lumineux : UNIQUEMENT hover, micro-interactions, détails
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: {
          DEFAULT: "#121212",
          soft: "#191A17",
          mist: "#222320",
        },
        cream: {
          DEFAULT: "#FCFEE9",
          soft: "#F5F7E2",
        },
        leaf: {
          DEFAULT: "#A3CD86",
          deep: "#7FAE63",
          faint: "#E4EFDA",
        },
        pulse: "#30FF12",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Impact", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
      letterSpacing: {
        kicker: "0.22em",
      },
      maxWidth: {
        wrap: "80rem",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      animation: {
        "pulse-dot": "pulseDot 2.4s ease-in-out infinite",
        marquee: "marquee 16s linear infinite",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.8)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
