/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0F2A4A",
        "navy-mid": "#17466F",
        accent: "#1E6FBF",
        "accent-light": "#E6F0FB",
        success: "#1A7F5A",
        "success-light": "#E5F5EE",
        warn: "#D97706",
        "warn-light": "#FEF3C7",
        danger: "#dc2626",
        "danger-light": "#fee2e2",
      },
      fontFamily: {
        display: [
          "Segoe UI",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        sans: ["Inter", "Segoe UI", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
