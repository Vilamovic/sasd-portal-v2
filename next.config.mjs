import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Webpack config dla React-Quill (wymaga window)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

// Wrap config with Sentry
export default withSentryConfig(nextConfig, {
  // Sentry Webpack Plugin Options
  silent: true, // Suppresses source map uploading logs
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Upload source maps for error stack traces
  widenClientFileUpload: true,

  // Hide source maps from browser devtools
  hideSourceMaps: true,
});
