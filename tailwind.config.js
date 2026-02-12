import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./templates/**/*.ejs",
    "./docs/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        // Primary accent color - used for links, highlights, interactive elements
        // Change this to switch the site's accent color (e.g., colors.blue, colors.emerald)
        primary: colors.cyan,

        // Background colors - page and surface hierarchy
        background: {
          DEFAULT: colors.gray[950],  // Main page background
          surface: colors.gray[900],  // Header, footer, cards
          elevated: colors.gray[800], // Hover states, code blocks, tags
        },

        // Foreground/text colors
        foreground: {
          DEFAULT: colors.gray[300],  // Body text
          heading: colors.gray[100],  // Headings, strong emphasis
          muted: colors.gray[400],    // Secondary text, excerpts
          subtle: colors.gray[500],   // Timestamps, placeholders
          disabled: colors.gray[600], // Disabled states
        },

        // Border colors
        border: {
          DEFAULT: colors.gray[700],  // Standard borders (hr, tables)
          subtle: colors.gray[800],   // Subtle dividers
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: colors.gray[300],
            a: {
              color: colors.cyan[400],
              "&:hover": {
                color: colors.cyan[300]
              }
            }
          }
        }
      }
    }
  },
  plugins: []
};
