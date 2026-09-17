import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mineral: {
          50: "#f5f5f4",
          100: "#e7e5e4",
          200: "#d6d3d1",
          300: "#a8a29e",
          400: "#78716c",
          500: "#57534e",
          600: "#44403c",
          700: "#292524",
          800: "#1c1917",
          900: "#0c0a09",
        },
        leaf: {
          500: "#4d7c4f",
          600: "#3f6240",
          700: "#334d35",
        },
        ocher: {
          500: "#b08938",
          600: "#92702a",
        },
      },
      fontFamily: {
        serif: ["ui-serif", "Georgia", "Cambria", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;