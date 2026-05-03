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
      { source: '/favicon.ico', destination: '/icon.svg', permanent: false },
      { source: '/main', destination: '/', permanent: true },
      { source: '/main/:path*', destination: '/:path*', permanent: true },
      { source: '/zaloguj', destination: '/app/login', permanent: true },
      { source: '/database', destination: '/app/kandydaci', permanent: true },
      { source: '/database/candidate/:id', destination: '/app/kandydat/:id', permanent: true },
      { source: '/dashboard/:path*', destination: '/app/dashboard/:path*', permanent: true },
    ]
  },
};

export default nextConfig;
