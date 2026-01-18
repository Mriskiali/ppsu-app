import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Atau '20mb'
    },
  },
};

export default nextConfig;