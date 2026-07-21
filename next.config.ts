import { withAxiom } from "next-axiom";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "githubusercontent.com",
      },
    ],
  },

  env: {
    BUILD_TIME: new Date().toISOString(),
    COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA, // MUST NOT use null
  },
};

export default withAxiom(nextConfig);
