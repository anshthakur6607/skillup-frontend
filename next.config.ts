import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy /api requests to the backend during development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://skill-up-backend-ten.vercel.app/api/:path*',
      },
    ];
  },
};

export default nextConfig;
