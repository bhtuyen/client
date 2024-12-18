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
      }
    ]
  }
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
