import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";
import { env } from "./env";

const config: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"]
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  typedRoutes: true,
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *"
          }
        ]
      }
    ];
  }
};

export default withSentryConfig(config, {
  authToken: env.SENTRY_AUTH_TOKEN,
  org: env.SENTRY_ORG,
  project: env.SENTRY_PROJECT,
  silent: !process.env.CI,
  tunnelRoute: true,
  widenClientFileUpload: true
});
