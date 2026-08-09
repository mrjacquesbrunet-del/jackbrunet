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
        // Sombres : gris-noir neutre, centré sur #30302F (ex-olive)
        night: {
          950: "#131312",
          900: "#1C1C1B", // Encre — texte & fonds sombres
          800: "#242423",
          700: "#30302F", // Gris-noir — primaire (référence charte)
          600: "#3E3E3D",
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
        // Secondaire — gris neutre (ex-olive)
        spirit: {
          300: "#B4B4B1",
          400: "#8C8C89",
          500: "#5E5E5C",
          600: "#3E3E3D",
          700: "#2A2A29",
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
        spirit: "0 0 70px -20px rgba(48, 48, 47, 0.5)",
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
