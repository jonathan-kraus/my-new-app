// tailwind.config.ts (root directory)
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    // Gradient classes
    "bg-gradient-to-r",
    "bg-gradient-to-b",
    "from-blue-600",
    "from-blue-700",
    "via-blue-700",
    "to-blue-800",
    "to-indigo-900",
    "from-white",
    "from-green-50",
    "to-emerald-50",
    "to-transparent",

    // Opacity classes
    "bg-white/10",
    "bg-white/20",
    "hover:bg-white/20",
    "hover:bg-white/30",
    "border-white/20",
    "border-white/40",
    "ring-white/30",
    "ring-white/60",

    // Scale transforms
    "hover:scale-[1.02]",

    // Sidebar widths
    "w-64",
    "w-72",
  ],
};

export default config;
