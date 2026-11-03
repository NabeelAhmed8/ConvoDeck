import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "420px",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          500: "#ff6422",
          600: "#ea5414",
          700: "#c2410c",
        },
        accent: {
          DEFAULT: "#ff6422",
          hover: "#ea5414",
          light: "#fff1eb",
          dark: "#c2410c",
        },
        surface: {
          DEFAULT: "#ebf0f7",
          card: "#edf1f7",
          dark: "#cbd5e1",
          highlight: "#ffffff",
        },
        whatsapp: {
          light: "#25D366",
          dark: "#128C7E",
          teal: "#075E54",
          bg: "#EFEAE2",
        }
      },
    },
  },
  plugins: [],
};
export default config;
