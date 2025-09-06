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

    // Optimization for quantum computing libraries
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },

  // Configure headers for better performance
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
    enablePhaseVisualization: process.env.ENABLE_PHASE_VIZ !== 'false',
  },

  // Configure server runtime
  serverRuntimeConfig: {
    // Server-only config
    enableServerSideQuantum: process.env.ENABLE_SSR_QUANTUM === 'true',
    hadamardTestIterations: process.env.HADAMARD_ITERATIONS || '1000',
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
    MEASUREMENT_PRECISION: process.env.MEASUREMENT_PRECISION || '0.001',
  },

  // Configure redirects for better UX
  async redirects() {
    return [
      {
        source: '/hadamard',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
