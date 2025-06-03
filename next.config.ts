import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }
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

export default nextConfig;
