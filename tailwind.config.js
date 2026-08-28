/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        relay: {
          navy: "#0B1930",
          "navy-hover": "#15294A",
          "navy-muted": "#1A3258",
          teal: "#1B9A9C",
          "teal-light": "#27B5B2",
          "teal-dark": "#147B7D",
          "teal-subtle": "#E8F5F5",
          bg: "#FAFAF8",
          surface: "#FFFFFF",
          "surface-secondary": "#F3F5F4",
          border: "#E4E8E7",
          "text-primary": "#0B1930",
          "text-secondary": "#667085",
          "text-muted": "#98A2B3",
          // Dark mode / Dark sections
          "dark-bg": "#081426",
          "dark-surface": "#10223A",
          "dark-border": "#20324A",
          "dark-text": "#F8FAFC",
          "dark-muted": "#9BA8B8",
          "dark-teal": "#32C4BE",
        },
        semantic: {
          success: "#16A34A",
          warning: "#F59E0B",
          danger: "#E5484D",
          info: "#2F6FED",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        heading: ["Manrope", "Inter", "sans-serif"],
        mono: ["SF Mono", "Fira Code", "Courier New", "monospace"]
      },
      borderRadius: {
        sm: "8px",
        md: "14px",
        lg: "20px",
        xl: "28px"
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(11, 25, 48, 0.04), 0 1px 2px rgba(11, 25, 48, 0.02)",
        card: "0 4px 12px rgba(11, 25, 48, 0.03), 0 1px 3px rgba(11, 25, 48, 0.04)",
        elevated: "0 12px 32px -4px rgba(11, 25, 48, 0.08), 0 4px 12px -2px rgba(11, 25, 48, 0.03)"
      }
    }
  },
  plugins: []
};
