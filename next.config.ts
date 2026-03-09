import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      { source: '/main', destination: '/', permanent: true },
      { source: '/main/:path*', destination: '/:path*', permanent: true },
    ]
  },
};

export default nextConfig;
