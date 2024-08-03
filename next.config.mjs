/** @type {import('next').NextConfig} */
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
      }
    ]
  }
};

export default nextConfig;
