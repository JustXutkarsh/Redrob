import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F7F4EE",
        ink: "#0F172A",
        cyan: "#27D3D8",
        orange: "#FF6B35",
        yellow: "#F2CF63",
        success: "#22C55E"
      },
      boxShadow: {
        brutal: "8px 8px 0 #0F172A",
        brutalSm: "4px 4px 0 #0F172A"
      },
      borderRadius: {
        brutal: "28px"
      }
    }
  },
  plugins: []
};

export default config;
