/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        stripe: {
          blue: "#635bff",
          purple: "#9d33d6",
          dark: "#0a2540",
          slate: "#425466",
          light: "#f6f9fc",
          cyan: "#00d4ff",
        },
        background: {
          light: "#ffffff",
          dark: "#0a0e1a",
        },
        text: {
          light: "#425466",
          dark: "#e4e4e7",
        },
        heading: {
          light: "#0a2540",
          dark: "#ffffff",
        },
        card: {
          light: "#ffffff",
          dark: "#1a1f2e",
        },
        border: {
          light: "#e2e8f0",
          dark: "#2d3748",
        },
        glass: {
          light: "rgba(255, 255, 255, 0.2)",
          dark: "rgba(26, 31, 46, 0.4)",
        },
        nav: {
          light: "rgba(255, 255, 255, 0.3)",
          dark: "rgba(26, 31, 46, 0.8)",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Ubuntu", "sans-serif"],
        display: ["Stripe-Sohne", "Inter", "sans-serif"],
      },
      boxShadow: {
        stripe: "0 7px 14px 0 rgba(60,66,87,.08), 0 3px 6px 0 rgba(0,0,0,.12)",
        'stripe-hover': "0 13px 27px -5px rgba(50,50,93,.25), 0 8px 16px -8px rgba(0,0,0,.3), 0 -6px 16px -6px rgba(0,0,0,.025)",
        'dark-card': "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
        'dark-card-hover': "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
      },
      animation: {
        marquee: "marquee var(--duration) linear infinite",
        'marquee-reverse': "marquee-reverse var(--duration) linear infinite",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        'marquee-reverse': {
          from: { transform: "translateX(calc(-100% - var(--gap)))" },
          to: { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};