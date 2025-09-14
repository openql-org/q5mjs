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

  // Configure webpack for client-side quantum library and canvas optimization
  webpack: (config, { isServer }) => {
    // Don't process Q5M on server-side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('q5m');
    }

    // Handle dynamic imports and canvas operations
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    // Optimization for quantum computing and graphics libraries
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      canvas: false,
    };

    // Optimize for animation performance
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          quantum: {
            test: /[\\/]q5m/,
            name: 'quantum-lib',
            priority: 30,
          },
          animations: {
            test: /[\\/](canvas|animation|webgl)/,
            name: 'animation-lib',
            priority: 25,
          },
        },
      },
    };

    return config;
  },

  // Configure headers for better performance and CORS
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
      {
        source: '/(.*)',
        headers: [
          // Cache static assets aggressively
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // Configure public directory for quantum library access
  publicRuntimeConfig: {
    // Public config available on both server and client
    quantumLibraryPath: process.env.QUANTUM_LIBRARY_PATH || '/dist/q5m.min.js',
    enableHighDPICanvas: process.env.ENABLE_HIGH_DPI !== 'false',
    animationFPS: parseInt(process.env.ANIMATION_FPS) || 60,
    canvasResolution: parseFloat(process.env.CANVAS_RESOLUTION) || 1.0,
  },

  // Configure server runtime
  serverRuntimeConfig: {
    // Server-only config
    enableServerSideQuantum: process.env.ENABLE_SSR_QUANTUM === 'true',
    maxCanvasSize: process.env.MAX_CANVAS_SIZE || '2048',
    animationOptimization: process.env.ANIMATION_OPT !== 'false',
  },

  // Image optimization configuration
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Configure build output
  output: 'standalone',
  
  // Development and production environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    WAVE_RESOLUTION: process.env.WAVE_RESOLUTION || '1000',
    INTERFERENCE_PRECISION: process.env.INTERFERENCE_PRECISION || '0.001',
    ANIMATION_QUALITY: process.env.ANIMATION_QUALITY || 'high',
  },

  // Configure performance optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Configure redirects for better UX
  async redirects() {
    return [
      {
        source: '/interference',
        destination: '/',
        permanent: true,
      },
      {
        source: '/waves',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Configure rewrites for canvas asset serving
  async rewrites() {
    return [
      {
        source: '/canvas/:path*',
        destination: '/api/canvas/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
