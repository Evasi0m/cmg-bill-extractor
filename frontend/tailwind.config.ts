import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cmg: {
          red: "#d71920",
          ink: "#111827",
          line: "#d7dee8",
          soft: "#f5f7fb"
        }
      },
      boxShadow: {
        panel: "0 18px 50px rgba(17, 24, 39, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;

