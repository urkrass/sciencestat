import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        paper: "#fbfbf8",
        line: "#d9dee7",
        moss: "#2f6f5f",
        "moss-dark": "#24564b"
      },
      boxShadow: {
        sheet: "0 18px 50px rgba(23, 32, 51, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
