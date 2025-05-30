<<<<<<< HEAD



import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }
    ]
  },
 
    serverExternalPackages: [
      '@prisma/client',
      '@next-auth/prisma-adapter',
      'bcryptjs'
    ],
 
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
=======
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
>>>>>>> 9a6bb5eaf5fc71426c75b15bc069315aeb029533
