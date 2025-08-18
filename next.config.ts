import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  // Disable image optimization for production (using external URLs)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
