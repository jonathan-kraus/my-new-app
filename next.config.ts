// next.config.js
/** @type {import('next').NextConfig} */
const { withAxiom } = require("next-axiom");
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "githubusercontent.com",
      },
    ],
  },
};

module.exports = withAxiom(nextConfig);
