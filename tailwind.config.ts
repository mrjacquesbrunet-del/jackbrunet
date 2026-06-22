import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base nuit profonde — immersif, premium
        night: {
          950: "#070512",
          900: "#0B0918",
          800: "#120F22",
          700: "#1A1630",
          600: "#241F40",
        },
        // Or / aube — chaleur, lumière, gloire
        dawn: {
          50: "#FFF7ED",
          100: "#FFEAD0",
          200: "#FFD49E",
          300: "#FFB85C",
          400: "#FF9D2E",
          500: "#FF7A00",
          600: "#E85D00",
        },
        // Violet spirituel — profondeur, ciel
        spirit: {
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
        },
        // Bleu vivant — lumière, eau, vie
        glow: {
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9",
        },
        cream: "#FBF7F0",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        glow: "0 0 60px -15px rgba(255, 122, 0, 0.45)",
        spirit: "0 0 70px -20px rgba(139, 92, 246, 0.5)",
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
