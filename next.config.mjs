/** @type {import('next').NextConfig} */

import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  images: {
    remotePatterns: [
      {
        hostname: 'localhost',
        pathname: '/**',
        port: '4000',
        protocol: 'http'
      },
      {
        protocol: 'https',
        hostname: 'meapi.bhtuyen9912.id.vn',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'https://storage.googleapis.com/restaurant-store',
        port: '',
        pathname: '/**'
      }
    ],
    unoptimized: true // Không tối ưu hóa ảnh
  }
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
