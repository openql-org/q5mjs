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
        <h1>🎯 Hadamard Test with Nuxt.js</h1>
        <p>Interactive phase estimation using the Hadamard test quantum algorithm</p>
      </div>

      <!-- Client-only quantum component -->
      <ClientOnly>
        <HadamardTest />
        <template #fallback>
          <div class="loading">
            <div class="spinner"></div>
            <p>Loading quantum simulation...</p>
          </div>
        </template>
      </ClientOnly>

      <div class="info-section">
        <div class="card">
          <h3>📚 About the Hadamard Test</h3>
          <p>
            The Hadamard test is a fundamental quantum algorithm used for phase estimation. 
            It determines the eigenvalue (phase) of a unitary operator U acting on an eigenstate |ψ⟩.
          </p>
          <div class="algorithm-steps">
            <h4>Algorithm Steps:</h4>
            <ol>
              <li>Initialize ancilla qubit in |+⟩ = (|0⟩ + |1⟩)/√2</li>
              <li>Prepare target qubit in eigenstate |ψ⟩</li>
              <li>Apply controlled-U operation</li>
              <li>Apply final Hadamard to ancilla</li>
              <li>Measure ancilla: P(|0⟩) = (1 + cos(φ))/2</li>
            </ol>
          </div>
        </div>

        <div class="card">
          <h3>🛠 Technical Features</h3>
          <ul>
            <li><strong>Interactive Controls:</strong> Adjust phase parameters in real-time</li>
            <li><strong>Multiple Gates:</strong> Test Z, S, T, and custom phase gates</li>
            <li><strong>Phase Estimation:</strong> Extract phase from measurement statistics</li>
            <li><strong>Statistical Analysis:</strong> Compare theoretical vs measured probabilities</li>
            <li><strong>Multiple Measurements:</strong> Run 1000 measurements for statistical validation</li>
            <li><strong>Real-time Updates:</strong> Live probability updates during measurement runs</li>
          </ul>
        </div>

        <div class="card">
          <h3>🔬 Quantum Gates Tested</h3>
          <div class="gates-info">
            <div class="gate-item">
              <strong>Z Gate:</strong> Phase flip π, eigenvalues: ±1
            </div>
            <div class="gate-item">
              <strong>S Gate:</strong> Phase π/2, square root of Z
            </div>
            <div class="gate-item">
              <strong>T Gate:</strong> Phase π/4, eighth root of Z
            </div>
            <div class="gate-item">
              <strong>Phase Gate:</strong> Custom phase φ, e^(iφ)
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Meta configuration
const title = 'Q5M.js + Nuxt.js: Hadamard Test'
const description = 'Interactive Hadamard test quantum algorithm demonstration for phase estimation, featuring real-time controls, multiple quantum gates, and statistical measurement analysis using Q5M.js with Nuxt.js'

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
    { name: 'keywords', content: 'quantum computing, Hadamard test, phase estimation, quantum algorithms, quantum phase kickback' }
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
  background: linear-gradient(135deg, #4a90e2 0%, #7b68ee 100%);
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

.card ul, .card ol {
  margin: 0;
  padding-left: 20px;
}

.card li {
  margin-bottom: 8px;
  line-height: 1.5;
  opacity: 0.9;
}

.algorithm-steps {
  margin-top: 20px;
}

.algorithm-steps h4 {
  margin-bottom: 10px;
  color: #fff;
}

.algorithm-steps ol {
  counter-reset: step-counter;
}

.algorithm-steps li {
  counter-increment: step-counter;
  position: relative;
  padding-left: 10px;
}

.gates-info {
  display: grid;
  gap: 12px;
  margin-top: 15px;
}

.gate-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
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
