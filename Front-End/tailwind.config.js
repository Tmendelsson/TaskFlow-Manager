/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#11120D",
        paper: "#FFFDF3",
        copper: "#D58936",
        ocean: "#2A5C82",
        mint: "#4CA866"
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Work Sans'", "sans-serif"]
      },
      boxShadow: {
        card: "0 10px 30px rgba(17, 18, 13, 0.1)"
      }
    },
  },
  plugins: [],
};
