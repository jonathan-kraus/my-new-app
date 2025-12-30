// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverExternalPackages: [
      '@prisma/client/edge',
      '@neondatabase/serverless',
      '@prisma/adapter-neon'
    ],
  },
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

module.exports = nextConfig;
