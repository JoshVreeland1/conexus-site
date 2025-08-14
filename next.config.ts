// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Keep ESLint on in builds (we fixed the lint errors)
  eslint: { ignoreDuringBuilds: false },
  // Nothing fancy; add options here as needed later
};

export default nextConfig;

