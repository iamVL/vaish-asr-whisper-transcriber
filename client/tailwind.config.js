/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          900: "#001B4B", // deep navy
          700: "#02457A", // dark blue
          500: "#0178BE", // brand blue
          300: "#97CADB", // light blue
          100: "#D6E8EE", // mist
        },
        success: "#16a34a", // green-600
        danger: "#dc2626",  // red-600
        warn: "#f59e0b",    // amber-500
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
}
