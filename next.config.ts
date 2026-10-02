import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product pictures come from the business's SSS storage (any host): plain <img>, no optimizer.
    unoptimized: true,
  },
};

export default nextConfig;
