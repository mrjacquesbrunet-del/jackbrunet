import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    // Les classes de surlignage (couleurs) sont définies ici: à scanner aussi,
    // sinon Tailwind les purge et le surlignage n'affiche aucune couleur.
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sombres : Encre (#1F2216) + Olive (#3A3F28)
        night: {
          950: "#14160E",
          900: "#1F2216", // Encre — texte & fonds sombres
          800: "#272B1B",
          700: "#3A3F28", // Olive — primaire
          600: "#4B5133",
        },
        // Accent — Lime #CAF000
        dawn: {
          50: "#FAFFE0",
          100: "#F0FFB0",
          200: "#E4FB6E",
          300: "#D8F53A",
          400: "#CAF000",
          500: "#AAD000",
          600: "#879E00",
        },
        // Secondaire — Olive / vert profond
        spirit: {
          300: "#AEB98C",
          400: "#8A9760",
          500: "#5E6A3A",
          600: "#3A3F28",
          700: "#2A2E1C",
        },
        // Tertiaire — vert clair / lime adouci
        glow: {
          300: "#E4FB6E",
          400: "#CAF000",
          500: "#AAD000",
        },
        cream: "#F3F3ED",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        glow: "0 0 60px -15px rgba(202, 240, 0, 0.55)",
        spirit: "0 0 70px -20px rgba(58, 63, 40, 0.5)",
        card: "0 20px 60px -20px rgba(0, 0, 0, 0.6)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spin-slow 28s linear infinite",
        marquee: "marquee 38s linear infinite",
        shimmer: "shimmer 6s linear infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
