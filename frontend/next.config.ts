import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
  async rewrites() {
    const rawBackendUrl = process.env.BACKEND_INTERNAL_URL || "https://api.lankacare.me";
    const backendUrl = rawBackendUrl.replace(/\/+$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/actuator/:path*",
        destination: `${backendUrl}/actuator/:path*`,
      },
    ];
  },
};

export default nextConfig;
