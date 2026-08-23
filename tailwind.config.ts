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
        // Sombres — pilotés par variables CSS : olive par défaut (site),
        // gris-noir sombre dans l'app native (html[data-native], cf. globals.css).
        night: {
          950: "rgb(var(--n-950) / <alpha-value>)",
          900: "rgb(var(--n-900) / <alpha-value>)", // Encre — texte & fonds sombres
          800: "rgb(var(--n-800) / <alpha-value>)",
          700: "rgb(var(--n-700) / <alpha-value>)", // primaire
          600: "rgb(var(--n-600) / <alpha-value>)",
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
        // Secondaire — pilotée par variables CSS (olive site / gris app)
        spirit: {
          300: "rgb(var(--s-300) / <alpha-value>)",
          400: "rgb(var(--s-400) / <alpha-value>)",
          500: "rgb(var(--s-500) / <alpha-value>)",
          600: "rgb(var(--s-600) / <alpha-value>)",
          700: "rgb(var(--s-700) / <alpha-value>)",
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
        game: ["var(--font-game)", "var(--font-sans)", "system-ui", "sans-serif"],
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
