import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  cacheComponents: true,
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"]
    // globalNotFound: true
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  typedRoutes: true,
  devIndicators: false
};

export default config;
