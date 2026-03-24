/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
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
        background: "#ffffff",
        text: "#425466",
        heading: "#0a2540",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Ubuntu", "sans-serif"],
        display: ["Stripe-Sohne", "Inter", "sans-serif"],
      },
      boxShadow: {
        stripe: "0 7px 14px 0 rgba(60,66,87,.08), 0 3px 6px 0 rgba(0,0,0,.12)",
        'stripe-hover': "0 13px 27px -5px rgba(50,50,93,.25), 0 8px 16px -8px rgba(0,0,0,.3), 0 -6px 16px -6px rgba(0,0,0,.025)",
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