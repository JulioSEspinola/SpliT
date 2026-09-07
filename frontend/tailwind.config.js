/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe7ff",
          200: "#bcd2ff",
          300: "#8fb3ff",
          400: "#5c8bff",
          500: "#3763f4",
          600: "#2647d8",
          700: "#2138ae",
          800: "#20328a",
          900: "#1f2e6e",
        },
        owed: {
          DEFAULT: "#16a34a",
          bg: "#dcfce7",
        },
        owing: {
          DEFAULT: "#dc2626",
          bg: "#fee2e2",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.08)",
      },
    },
  },
  plugins: [],
}
