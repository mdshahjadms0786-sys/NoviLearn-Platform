const { designTokens } = require("@novilearn/design-tokens");

const config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,jsx,mdx}",
    "./src/components/**/*.{js,jsx,mdx}",
    "./src/app/**/*.{js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: [
          designTokens.typography.fontSizes.xs,
          {
            lineHeight: "1.5",
          },
        ],
        sm: [
          designTokens.typography.fontSizes.sm,
          {
            lineHeight: "1.5",
          },
        ],
        base: [
          designTokens.typography.fontSizes.base,
          {
            lineHeight: "1.5",
          },
        ],
        lg: [
          designTokens.typography.fontSizes.lg,
          {
            lineHeight: "1.5",
          },
        ],
        xl: [
          designTokens.typography.fontSizes.xl,
          {
            lineHeight: "1.5",
          },
        ],
        "2xl": [
          designTokens.typography.fontSizes["2xl"],
          {
            lineHeight: "1.25",
          },
        ],
        "3xl": [
          designTokens.typography.fontSizes["3xl"],
          {
            lineHeight: "1.25",
          },
        ],
        "4xl": [
          designTokens.typography.fontSizes["4xl"],
          {
            lineHeight: "1.1",
          },
        ],
        "5xl": [
          designTokens.typography.fontSizes["5xl"],
          {
            lineHeight: "1.1",
          },
        ],
        "6xl": [
          designTokens.typography.fontSizes["6xl"],
          {
            lineHeight: "1.1",
          },
        ],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      boxShadow: {
        "inner-light": designTokens.shadows.inner,
      },
      screens: {
        ...designTokens.breakpoints,
      },
      zIndex: {
        hide: String(designTokens.zIndex.hide),
        base: String(designTokens.zIndex.base),
        dropdown: String(designTokens.zIndex.dropdown),
        sticky: String(designTokens.zIndex.sticky),
        modal: String(designTokens.zIndex.modal),
        popover: String(designTokens.zIndex.popover),
        toast: String(designTokens.zIndex.toast),
        tooltip: String(designTokens.zIndex.tooltip),
      },
      transitionDuration: {
        0: "0ms",
        150: "150ms",
        200: "200ms",
        300: "300ms",
      },
      transitionTimingFunction: {
        "ease-in-out": "ease",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

module.exports = config;
