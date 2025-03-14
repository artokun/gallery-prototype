import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  env: {
    NEXT_APP_UNSPLASH_ACCESS_KEY: process.env.NEXT_APP_UNSPLASH_ACCESS_KEY,
    NEXT_PUBLIC_UNSPLASH_ACCESS_KEY:
      process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ||
      process.env.NEXT_APP_UNSPLASH_ACCESS_KEY,
    NEXT_PUBLIC_UNSPLASH_APP_ID:
      process.env.NEXT_PUBLIC_UNSPLASH_APP_ID ||
      process.env.NEXT_APP_UNSPLASH_APP_ID,
  },
};

export default nextConfig;
