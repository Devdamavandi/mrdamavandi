import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

// Add bundle analyzer (conditional import)
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? bundleAnalyzer({ enabled: true })
  : (config: NextConfig) => config

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ]
  },

  // This option is only valid in app directory projects (Next.js 13+)
  experimental: {
  },

  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      os: false,
      vm: false,
      querystring: false,
      path: false,
      zlib: false,
      fs: false
    };
    return config;
  }
};


// Wrap the config with analyzer (only when enabled)
export default withBundleAnalyzer(nextConfig)
