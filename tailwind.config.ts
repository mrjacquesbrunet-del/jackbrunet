import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base sombre — noir chaud + olive profond (inspiration landonorris)
        night: {
          950: "#0A0B07",
          900: "#0F100A",
          800: "#171911",
          700: "#23271A",
          600: "#2F3422",
        },
        // Accent principal — vert lime / chartreuse vif
        dawn: {
          50: "#F8FFE3",
          100: "#EEFFB6",
          200: "#E0FB7E",
          300: "#D2F84F",
          400: "#C6F03C",
          500: "#B2E215",
          600: "#92BD0A",
        },
        // Secondaire — vert mousse / olive
        spirit: {
          300: "#AECB6A",
          400: "#8DB23E",
          500: "#647F2B",
          600: "#45561E",
          700: "#323F17",
        },
        // Tertiaire — vert feuille / lumineux
        glow: {
          300: "#DCF79A",
          400: "#C2EA5E",
          500: "#A3D331",
        },
        cream: "#EFEDE1",
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
        glow: "0 0 60px -15px rgba(198, 240, 60, 0.5)",
        spirit: "0 0 70px -20px rgba(141, 178, 62, 0.45)",
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
