/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0081A7",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F07167",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F5F5F5",
          foreground: "#737373",
        },
        background: "#FFFFFF",
        foreground: "#171717",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#171717",
        },
        border: "#E5E5E5",
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
}
