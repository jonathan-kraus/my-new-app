// next.config.js
import { withAxiom } from "next-axiom";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default withAxiom(nextConfig);
