import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gzip/Brotli compression is enabled by default in Next.js production builds.
  // Pin Turbopack's workspace root to this project so the build does not pick up
  // a stray package-lock.json in the user home directory.
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    optimizePackageImports: ["react-leaflet", "@supabase/supabase-js"],
  },
};

export default nextConfig;
