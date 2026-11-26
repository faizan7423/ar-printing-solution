import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.AR_NEXT_DIST_DIR || ".next-v4",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
