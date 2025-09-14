<template>
<!-- SPDX-License-Identifier: MIT -->
<!-- SPDX-FileCopyrightText: Copyright 2025 OpenQL Project -->
  <div>
    <NuxtHead>
      <title>{{ title }}</title>
      <meta name="description" :content="description" />
    </NuxtHead>

    <div class="container">
      <div class="header">
        <h1>🔗 Quantum Entanglement with Nuxt.js</h1>
        <p>Explore Bell states, GHZ states, and W states using Q5M.js</p>
      </div>

      <!-- Client-only quantum component -->
      <ClientOnly>
        <EntanglementDemo />
        <template #fallback>
          <div class="loading">
            <div class="spinner"></div>
            <p>Loading quantum simulation...</p>
          </div>
        </template>
      </ClientOnly>

      <div class="info-section">
        <div class="card">
          <h3>📚 About Quantum Entanglement</h3>
          <p>
            Quantum entanglement is a phenomenon where quantum particles become interconnected 
            and the state of one particle instantly affects the other, regardless of distance.
            This demo explores famous entangled states:
          </p>
          <ul>
            <li><strong>Bell States:</strong> Maximally entangled two-qubit states</li>
            <li><strong>GHZ State:</strong> Multi-particle entangled state</li>
            <li><strong>W State:</strong> Symmetric three-qubit entangled state</li>
          </ul>
        </div>

        <div class="card">
          <h3>🛠 Technical Implementation</h3>
          <p>This application demonstrates:</p>
          <ul>
            <li>Nuxt.js SSR/SPA hybrid mode</li>
            <li>Client-side quantum computing with Q5M.js</li>
            <li>Reactive quantum state visualization</li>
            <li>Real-time probability calculations</li>
            <li>Complex amplitude representations</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Meta configuration
const title = 'Q5M.js + Nuxt.js: Quantum Entanglement'
const description = 'Interactive quantum entanglement demonstration showcasing Bell states, GHZ states, and W states using Q5M.js quantum computing library with Nuxt.js'

// SEO head management
useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { name: 'author', content: 'Q5M.js Team' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description }
  ]
})

// Runtime config
const config = useRuntimeConfig()
console.log('App:', config.public.appName, 'v' + config.public.version)
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.info-section {
  margin-top: 40px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #fff;
}

.card p {
  margin-bottom: 15px;
  line-height: 1.6;
  opacity: 0.9;
}

.card ul {
  margin: 0;
  padding-left: 20px;
}

.card li {
  margin-bottom: 8px;
  line-height: 1.5;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .info-section {
    grid-template-columns: 1fr;
  }
}
</style>
