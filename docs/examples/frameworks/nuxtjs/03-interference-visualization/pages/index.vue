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
        <h1>🌊 Quantum Interference with Nuxt.js</h1>
        <p>Explore wave-particle duality and superposition through interactive visualizations</p>
      </div>

      <!-- Client-only quantum component -->
      <ClientOnly>
        <InterferenceVisualization />
        <template #fallback>
          <div class="loading">
            <div class="spinner"></div>
            <p>Loading quantum simulation...</p>
          </div>
        </template>
      </ClientOnly>

      <div class="info-section">
        <div class="card">
          <h3>🔬 Quantum Interference Experiments</h3>
          <p>
            Quantum interference demonstrates the wave nature of quantum particles and the 
            principle of superposition. These classic experiments reveal the fundamental 
            quantum mechanical behavior that defies classical intuition.
          </p>
          <div class="experiments-list">
            <div class="experiment-item">
              <h4>🔄 Double-Slit Experiment</h4>
              <p>The quintessential quantum experiment showing wave-particle duality. A quantum particle passes through both slits simultaneously, creating an interference pattern.</p>
            </div>
            <div class="experiment-item">
              <h4>🔀 Mach-Zehnder Interferometer</h4>
              <p>An optical interferometer using beam splitters to demonstrate quantum superposition and phase-dependent interference.</p>
            </div>
            <div class="experiment-item">
              <h4>📡 Ramsey Fringes</h4>
              <p>Time-domain interference created by two separated oscillating fields, fundamental to atomic clocks and precision measurements.</p>
            </div>
            <div class="experiment-item">
              <h4>⚙️ Custom Superposition</h4>
              <p>Explore arbitrary quantum superpositions with adjustable amplitudes and phases to understand interference principles.</p>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>🛠 Technical Features</h3>
          <ul>
            <li><strong>Real-time Animation:</strong> Smooth Canvas-based wave visualizations</li>
            <li><strong>Interactive Controls:</strong> Adjust phase relationships and amplitudes</li>
            <li><strong>Multiple Experiments:</strong> Four different interference scenarios</li>
            <li><strong>Live Quantum State:</strong> Real-time probability and amplitude calculations</li>
            <li><strong>Mathematical Analysis:</strong> Complete wave function representations</li>
            <li><strong>Responsive Design:</strong> Optimized for all screen sizes</li>
          </ul>
        </div>

        <div class="card">
          <h3>📊 Wave Function Mathematics</h3>
          <div class="math-content">
            <div class="formula-block">
              <h4>Superposition Principle</h4>
              <div class="formula">|ψ⟩ = α|0⟩ + βe^(iφ)|1⟩</div>
              <p>where |α|² + |β|² = 1</p>
            </div>
            <div class="formula-block">
              <h4>Interference Condition</h4>
              <div class="formula">P(|0⟩) = |α|²</div>
              <div class="formula">P(|1⟩) = |β|²</div>
              <p>with interference terms depending on relative phase φ</p>
            </div>
            <div class="formula-block">
              <h4>Classical Wave Analogy</h4>
              <div class="formula">ψ(x,t) = A₁sin(kx - ωt) + A₂sin(kx - ωt + φ)</div>
              <p>Constructive: φ = 2nπ, Destructive: φ = (2n+1)π</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Meta configuration
const title = 'Q5M.js + Nuxt.js: Quantum Interference'
const description = 'Interactive quantum interference visualization showcasing wave-particle duality, double-slit experiment, Mach-Zehnder interferometer, Ramsey fringes, and custom superposition states using Q5M.js quantum computing library with Nuxt.js'

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
    { name: 'twitter:description', content: description },
    { name: 'keywords', content: 'quantum computing, interference, superposition, wave-particle duality, quantum mechanics, visualization' }
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
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
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
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
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

.experiments-list {
  margin-top: 20px;
}

.experiment-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 15px;
}

.experiment-item h4 {
  margin-bottom: 8px;
  color: #81C784;
}

.experiment-item p {
  margin: 0;
  font-size: 0.95rem;
  opacity: 0.9;
}

.math-content {
  margin-top: 15px;
}

.formula-block {
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.formula-block h4 {
  margin-bottom: 10px;
  color: #81C784;
  font-size: 1.1rem;
}

.formula {
  background: rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 6px;
  font-family: 'Times New Roman', serif;
  font-size: 16px;
  text-align: center;
  color: #fff;
  font-weight: bold;
  margin-bottom: 8px;
  font-style: italic;
}

.formula-block p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
  text-align: center;
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
  
  .formula {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .experiment-item h4 {
    font-size: 1rem;
  }
  
  .experiment-item p {
    font-size: 0.9rem;
  }
}
</style>
