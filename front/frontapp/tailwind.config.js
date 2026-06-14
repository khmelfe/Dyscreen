const withOpacity = (variable) => {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}) / 1)`;
    }

    return `rgb(var(${variable}) / ${opacityValue})`;
  };
};

module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: withOpacity("--background-rgb"),
        foreground: withOpacity("--foreground-rgb"),
        card: withOpacity("--card-rgb"),
        "card-foreground": withOpacity("--card-foreground-rgb"),
        popover: withOpacity("--popover-rgb"),
        "popover-foreground": withOpacity("--popover-foreground-rgb"),
        primary: withOpacity("--primary-rgb"),
        "primary-foreground": withOpacity("--primary-foreground-rgb"),
        secondary: withOpacity("--secondary-rgb"),
        "secondary-foreground": withOpacity("--secondary-foreground-rgb"),
        muted: withOpacity("--muted-rgb"),
        "muted-foreground": withOpacity("--muted-foreground-rgb"),
        accent: withOpacity("--accent-rgb"),
        "accent-foreground": withOpacity("--accent-foreground-rgb"),
        destructive: withOpacity("--destructive-rgb"),
        "destructive-foreground": withOpacity("--destructive-foreground-rgb"),
        border: withOpacity("--border-rgb"),
        input: withOpacity("--input-rgb"),
        "input-background": withOpacity("--input-background-rgb"),
        ring: withOpacity("--ring-rgb"),
        "chart-1": withOpacity("--chart-1-rgb"),
        "chart-2": withOpacity("--chart-2-rgb"),
        "chart-3": withOpacity("--chart-3-rgb"),
        "chart-4": withOpacity("--chart-4-rgb"),
        "chart-5": withOpacity("--chart-5-rgb"),
        sidebar: withOpacity("--sidebar-rgb"),
        "sidebar-foreground": withOpacity("--sidebar-foreground-rgb"),
        "sidebar-primary": withOpacity("--sidebar-primary-rgb"),
        "sidebar-primary-foreground": withOpacity("--sidebar-primary-foreground-rgb"),
        "sidebar-accent": withOpacity("--sidebar-accent-rgb"),
        "sidebar-accent-foreground": withOpacity("--sidebar-accent-foreground-rgb"),
        "sidebar-border": withOpacity("--sidebar-border-rgb"),
        "sidebar-ring": withOpacity("--sidebar-ring-rgb"),
      },
      borderRadius: {
        xs: "calc(var(--radius) - 6px)",
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%, 70%, 100%": { opacity: "1" },
          "20%, 50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [],
};
