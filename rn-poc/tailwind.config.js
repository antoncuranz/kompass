/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Match web app's CSS custom properties
        primary: {
          DEFAULT: "#0a0a0a", // hsl(240 10% 3.9%)
          foreground: "#fafafa", // hsl(0 0% 98%)
        },
        secondary: {
          DEFAULT: "#f4f4f5", // hsl(240 4.8% 95.9%)
          foreground: "#18181b", // hsl(240 5.9% 10%)
        },
        muted: {
          DEFAULT: "#f7f9fa", // hsl(210 28.57% 97.25%)
          foreground: "#71717a", // hsl(240 3.8% 46.1%)
        },
        background: "#ffffff", // hsl(0 0% 100%)
        foreground: "#0a0a0a", // hsl(240 10% 3.9%)
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0a0a0a",
        },
        border: "#e4e4e7", // hsl(240 5.9% 90%)
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#fafafa",
        },
        accent: {
          DEFAULT: "#f4f4f5",
          foreground: "#18181b",
        },
      },
    },
  },
  plugins: [],
}
