/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['child_process', 'bcryptjs'],
  env: {
    CALLE_API_KEY: process.env.CALLE_API_KEY || "iams_live_a1IuQHh4OF6qWEcgsW5M_74502bb6edb8193a9fb3031e03edb16f327eec5b6dc27af7f96523b1bd4b2f02",
    CALLE_SOURCE: process.env.CALLE_SOURCE || "skills_sh",
    CALLE_INTEGRATION: process.env.CALLE_INTEGRATION || "skills_sh_skill",
    CALLE_INTEGRATION_VERSION: process.env.CALLE_INTEGRATION_VERSION || "0.1.0",
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
