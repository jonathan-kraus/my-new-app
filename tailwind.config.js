/*
 * @FilePath: \my-new-app\tailwind.config.js
 * @LastEditTime: 2026-08-09 23:59:34
 */
extend: {
  keyframes: {
    fadeIn: {
      "0%": { opacity: 0, transform: "translateY(10px)" },
      "100%": { opacity: 1, transform: "translateY(0)" },
    },
    rowIn: {
      "0%": { opacity: 0, transform: "translateX(-10px)" },
      "100%": { opacity: 1, transform: "translateX(0)" },
    },
  },
}
