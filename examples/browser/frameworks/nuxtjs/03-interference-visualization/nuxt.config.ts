// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true, // Enable SSR by default, but quantum components will be client-only
  
  // App configuration
  app: {
    head: {
      title: 'Q5M.js + Nuxt.js: Quantum Interference',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Interactive quantum interference visualization showcasing wave-particle duality and superposition using Q5M.js and Nuxt.js' },
        { name: 'keywords', content: 'quantum computing, interference, superposition, double-slit, Mach-Zehnder, Ramsey fringes, wave functions, Nuxt.js, Vue.js' }
      ],
      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/q5m@latest/dist/q5m.min.js',
          defer: true
        }
      ]
    }
  },

  // CSS configuration
  css: ['~/assets/styles/main.css'],

  // Build configuration
  build: {
    transpile: []
  },

  // Runtime config for environment variables
  runtimeConfig: {
    public: {
      appName: 'Q5M.js Interference Visualization Demo',
      version: '1.0.0'
    }
  },

  // Enable client-side hydration for quantum components
  experimental: {
    payloadExtraction: false // Disable payload extraction for better client-side performance
  }
})
