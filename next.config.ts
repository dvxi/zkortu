import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // dev only: Playwright and curl reach the dev server via 127.0.0.1
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  async redirects() {
    return [
      // junior section hidden until launch (client request, Aug 2026)
      { source: "/tenis-juniorski", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
