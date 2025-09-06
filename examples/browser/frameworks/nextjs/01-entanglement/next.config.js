// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Enable experimental features for better performance
  experimental: {
    // Enable SWC minification for better performance
    swcMinify: true,
  },

  // Configure webpack for client-side quantum library loading
  webpack: (config, { isServer }) => {
    // Don't process Q5M on server-side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('q5m');
    }

    // Handle dynamic imports properly
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    return config;
  },

  // Configure headers for CORS if needed
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },

  // Configure public directory for quantum library access
  publicRuntimeConfig: {
    // Public config that will be available on both server and client
    quantumLibraryPath: process.env.QUANTUM_LIBRARY_PATH || '/dist/q5m.min.js',
  },

  // Configure server runtime
  serverRuntimeConfig: {
    // Server-only config
    enableServerSideQuantum: process.env.ENABLE_SSR_QUANTUM === 'true',
  },

  // Image optimization configuration
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },

  // Configure build output
  output: 'standalone',
  
  // Development configuration
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
