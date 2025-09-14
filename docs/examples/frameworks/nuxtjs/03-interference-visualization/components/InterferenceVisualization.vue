<template>
<!-- SPDX-License-Identifier: MIT -->
<!-- SPDX-FileCopyrightText: Copyright 2025 OpenQL Project -->
  <div class="interference-visualization">
    <div class="card">
      <h3>🎮 Experiment Controls</h3>
      <div class="control-panel">
        <div class="experiment-buttons">
          <button 
            @click="doubleSlitExperiment" 
            :class="{ active: currentExperiment === 'double-slit' }"
          >
            🔄 Double-Slit
          </button>
          <button 
            @click="machZehnderInterferometer" 
            :class="{ active: currentExperiment === 'mach-zehnder' }"
          >
            🔀 Mach-Zehnder
          </button>
          <button 
            @click="ramseyFringes" 
            :class="{ active: currentExperiment === 'ramsey' }"
          >
            📡 Ramsey Fringes
          </button>
          <button 
            @click="customSuperposition" 
            :class="{ active: currentExperiment === 'custom' }"
          >
            ⚙️ Custom
          </button>
        </div>

        <div class="parameter-controls">
          <div class="control-group">
            <label>Relative Phase (φ):</label>
            <input 
              type="range" 
              v-model="relativephase" 
              min="0" 
              max="6.283" 
              step="0.01" 
              @input="updateInterference"
            />
            <span class="value-display">{{ phaseDisplay }}</span>
          </div>

          <div class="control-group" v-show="currentExperiment === 'double-slit' || currentExperiment === 'custom'">
            <label>Amplitude Ratio:</label>
            <input 
              type="range" 
              v-model="amplitudeRatio" 
              min="0" 
              max="1" 
              step="0.01" 
              @input="updateInterference"
            />
            <span class="value-display">{{ parseFloat(amplitudeRatio).toFixed(2) }}</span>
          </div>

          <div class="control-group">
            <label>Animation Speed:</label>
            <input 
              type="range" 
              v-model="animationSpeed" 
              min="0.1" 
              max="3" 
              step="0.1" 
            />
            <span class="value-display">{{ parseFloat(animationSpeed).toFixed(1) }}x</span>
          </div>
        </div>
      </div>
    </div>

    <div class="visualization-area">
      <div class="card">
        <h3>🌊 Wave Interference Pattern</h3>
        <div class="canvas-container">
          <canvas 
            ref="canvas" 
            width="600" 
            height="300"
            class="interference-canvas"
          ></canvas>
        </div>
        
        <div class="wave-legend">
          <div class="legend-item">
            <div class="legend-color wave1"></div>
            <span>Wave 1</span>
          </div>
          <div class="legend-item">
            <div class="legend-color wave2"></div>
            <span>Wave 2</span>
          </div>
          <div class="legend-item">
            <div class="legend-color interference"></div>
            <span>Interference Pattern</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>📊 Quantum State Analysis</h3>
        <div class="quantum-analysis">
          <div class="state-info">
            <div class="info-row">
              <strong>Current Experiment:</strong>
              <span>{{ experimentTitle }}</span>
            </div>
            <div class="info-row">
              <strong>Wave Function:</strong>
              <span class="wave-function">{{ waveFunction }}</span>
            </div>
            <div class="info-row">
              <strong>Interference Condition:</strong>
              <span class="interference-condition">{{ interferenceCondition }}</span>
            </div>
          </div>

          <div class="probabilities-display">
            <h4>Measurement Probabilities</h4>
            <div class="prob-bars">
              <div 
                v-for="(prob, index) in probabilities" 
                :key="index" 
                class="prob-bar"
              >
                <div class="bar-label">P(|{{ index }}⟩)</div>
                <div class="bar-container">
                  <div 
                    class="bar" 
                    :style="{ width: (prob * 100) + '%' }"
                  ></div>
                </div>
                <div class="bar-value">{{ (prob * 100).toFixed(1) }}%</div>
              </div>
            </div>
          </div>

          <div class="amplitudes-display">
            <h4>Quantum Amplitudes</h4>
            <div class="amplitude-grid">
              <div 
                v-for="(amp, index) in displayAmplitudes" 
                :key="index" 
                class="amplitude-item"
                v-show="amp.magnitude > 0.01"
              >
                <div class="state-label">|{{ index }}⟩</div>
                <div class="amplitude-value">
                  <div class="complex-number">{{ formatComplex(amp) }}</div>
                  <div class="magnitude">|{{ amp.magnitude.toFixed(3) }}|</div>
                  <div class="phase">∠{{ (amp.phase * 180 / Math.PI).toFixed(1) }}°</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card experiment-description">
      <h3>🔬 {{ experimentTitle }}</h3>
      <p class="experiment-text">{{ experimentDescription }}</p>
      
      <div class="physics-insights">
        <h4>Key Physics Concepts</h4>
        <div class="insights-grid">
          <div class="insight-item">
            <strong>Superposition:</strong> Quantum particles exist in multiple states simultaneously
          </div>
          <div class="insight-item">
            <strong>Wave-Particle Duality:</strong> Quantum objects exhibit both wave and particle properties
          </div>
          <div class="insight-item">
            <strong>Phase Relationships:</strong> Relative phase determines constructive/destructive interference
          </div>
          <div class="insight-item">
            <strong>Measurement:</strong> Observation collapses the quantum superposition
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Type declarations for Q5M (client-side only)
declare global {
  var Q5M: any
}

// Reactive state
const relativephase = ref(0)
const amplitudeRatio = ref(0.7)
const animationSpeed = ref(1.5)
const currentExperiment = ref('double-slit')
const quantumState = ref<any>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const animationId = ref<number | null>(null)
const time = ref(0)

// Computed properties
const phaseDisplay = computed(() => {
  const phase = parseFloat(relativephase.value.toString())
  const piRatio = phase / Math.PI
  
  if (Math.abs(piRatio) < 0.01) return '0'
  if (Math.abs(piRatio - 1) < 0.05) return 'π'
  if (Math.abs(piRatio - 2) < 0.05) return '2π'
  if (Math.abs(piRatio - 0.5) < 0.05) return 'π/2'
  if (Math.abs(piRatio - 1.5) < 0.05) return '3π/2'
  
  return `${phase.toFixed(2)}`
})

const probabilities = computed(() => {
  if (!quantumState.value) return []
  try {
    return quantumState.value.probabilities()
  } catch (error) {
    console.error('Error computing probabilities:', error)
    return []
  }
})

const displayAmplitudes = computed(() => {
  if (!quantumState.value) return []
  try {
    const amps = quantumState.value.amplitudes()
    
    return amps.map((amp: any) => {
      if (!amp) return { magnitude: 0, phase: 0, re: 0, im: 0 }
      
      const magnitude = Math.sqrt(amp.re * amp.re + amp.im * amp.im)
      const phase = Math.atan2(amp.im, amp.re)
      
      return {
        magnitude,
        phase,
        re: amp.re,
        im: amp.im
      }
    })
  } catch (error) {
    console.error('Error computing amplitudes:', error)
    return []
  }
})

const experimentTitle = computed(() => {
  switch (currentExperiment.value) {
    case 'double-slit': return 'Double-Slit Experiment'
    case 'mach-zehnder': return 'Mach-Zehnder Interferometer'
    case 'ramsey': return 'Ramsey Fringes'
    case 'custom': return 'Custom Superposition'
    default: return 'Quantum Interference'
  }
})

const experimentDescription = computed(() => {
  switch (currentExperiment.value) {
    case 'double-slit':
      return 'Classic demonstration of wave-particle duality. A quantum particle can travel through both slits simultaneously, creating an interference pattern that depends on the relative phase between the two paths.'
    case 'mach-zehnder':
      return 'Quantum interferometer using beam splitters. Demonstrates how quantum amplitudes combine and interfere, with the final measurement probability depending on the relative phase accumulated along different optical paths.'
    case 'ramsey':
      return 'Time-domain interference experiment. Two separated oscillating fields create fringes in the final state population as a function of the phase difference between the fields, crucial for atomic clocks and precision measurements.'
    case 'custom':
      return 'Explore arbitrary quantum superpositions with adjustable amplitudes and phases. Observe how different combinations create constructive and destructive interference patterns in the measurement probabilities.'
    default:
      return ''
  }
})

const waveFunction = computed(() => {
  const ratio = parseFloat(amplitudeRatio.value.toString())
  const phase = phaseDisplay.value
  
  switch (currentExperiment.value) {
    case 'double-slit':
      return `|ψ⟩ = ${ratio.toFixed(2)}|path1⟩ + ${(Math.sqrt(1-ratio*ratio)).toFixed(2)}e^(i${phase})|path2⟩`
    case 'mach-zehnder':
      return `|ψ⟩ = (1/√2)(|0⟩ + e^(i${phase})|1⟩) after interferometer`
    case 'ramsey':
      return `|ψ⟩ = cos(θ/2)|0⟩ + sin(θ/2)e^(i${phase})|1⟩`
    case 'custom':
      return `|ψ⟩ = ${ratio.toFixed(2)}|0⟩ + ${(Math.sqrt(1-ratio*ratio)).toFixed(2)}e^(i${phase})|1⟩`
    default:
      return ''
  }
})

const interferenceCondition = computed(() => {
  switch (currentExperiment.value) {
    case 'double-slit':
      return 'Constructive: δ = 2nπ, Destructive: δ = (2n+1)π'
    case 'mach-zehnder':
      return 'Fringe visibility V = 2|α₁||α₂|/(|α₁|² + |α₂|²)'
    case 'ramsey':
      return 'Oscillation frequency ∝ detuning between field and transition'
    case 'custom':
      return 'P(|0⟩) = |α₀|², P(|1⟩) = |α₁|², with interference terms'
    default:
      return ''
  }
})

// Methods
const updateInterference = () => {
  createQuantumState()
  drawWavePattern()
}

const createQuantumState = () => {
  if (typeof window === 'undefined' || !window.Q5M) return
  
  try {
    const circuit = new window.Q5M.Circuit(1)
    const ratio = parseFloat(amplitudeRatio.value.toString())
    const phase = parseFloat(relativephase.value.toString())
    
    // Create superposition state based on current experiment
    switch (currentExperiment.value) {
      case 'double-slit':
      case 'custom':
        // General superposition with adjustable amplitude and phase
        const theta = Math.acos(ratio)
        circuit.ry(0, 2 * theta)
        if (Math.abs(phase) > 0.01) {
          circuit.rz(0, phase)
        }
        break
        
      case 'mach-zehnder':
        // Symmetric superposition with phase
        circuit.h(0)
        if (Math.abs(phase) > 0.01) {
          circuit.rz(0, phase)
        }
        break
        
      case 'ramsey':
        // Ramsey sequence simulation
        circuit.ry(0, Math.PI/2)  // First π/2 pulse
        circuit.rz(0, phase)       // Free evolution phase
        circuit.ry(0, Math.PI/2 * ratio)  // Second pulse (variable)
        break
    }
    
    const result = circuit.execute()
    quantumState.value = result.state
  } catch (error) {
    console.error('Error creating quantum state:', error)
  }
}

const drawWavePattern = () => {
  if (!canvas.value) return
  
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return
  
  const width = canvas.value.width
  const height = canvas.value.height
  
  // Clear canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
  ctx.fillRect(0, 0, width, height)
  
  // Draw interference pattern
  const centerY = height / 2
  const amplitude1 = parseFloat(amplitudeRatio.value.toString()) * 50
  const amplitude2 = Math.sqrt(1 - amplitudeRatio.value * amplitudeRatio.value) * 50
  const phase = parseFloat(relativephase.value.toString())
  const timeOffset = time.value * parseFloat(animationSpeed.value.toString())
  
  ctx.lineWidth = 2
  
  // Draw wave 1
  ctx.strokeStyle = 'rgba(76, 175, 80, 0.8)'
  ctx.beginPath()
  for (let x = 0; x < width; x++) {
    const y1 = centerY + amplitude1 * Math.sin(0.02 * x + timeOffset)
    if (x === 0) ctx.moveTo(x, y1)
    else ctx.lineTo(x, y1)
  }
  ctx.stroke()
  
  // Draw wave 2
  ctx.strokeStyle = 'rgba(156, 39, 176, 0.8)'
  ctx.beginPath()
  for (let x = 0; x < width; x++) {
    const y2 = centerY + amplitude2 * Math.sin(0.02 * x + timeOffset + phase)
    if (x === 0) ctx.moveTo(x, y2)
    else ctx.lineTo(x, y2)
  }
  ctx.stroke()
  
  // Draw interference pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 1)'
  ctx.lineWidth = 3
  ctx.beginPath()
  for (let x = 0; x < width; x++) {
    const y1 = amplitude1 * Math.sin(0.02 * x + timeOffset)
    const y2 = amplitude2 * Math.sin(0.02 * x + timeOffset + phase)
    const yTotal = centerY + y1 + y2
    if (x === 0) ctx.moveTo(x, yTotal)
    else ctx.lineTo(x, yTotal)
  }
  ctx.stroke()
  
  // Add labels
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.font = '12px monospace'
  ctx.fillText('Wave 1', 10, 20)
  ctx.fillText('Wave 2', 10, 35)
  ctx.fillText('Interference', 10, 50)
}

const animate = () => {
  time.value += 0.05
  drawWavePattern()
  animationId.value = requestAnimationFrame(animate)
}

// Experiment methods
const doubleSlitExperiment = () => {
  currentExperiment.value = 'double-slit'
  updateInterference()
}

const machZehnderInterferometer = () => {
  currentExperiment.value = 'mach-zehnder'
  amplitudeRatio.value = 0.707 // 1/√2
  updateInterference()
}

const ramseyFringes = () => {
  currentExperiment.value = 'ramsey'
  updateInterference()
}

const customSuperposition = () => {
  currentExperiment.value = 'custom'
  updateInterference()
}

const formatComplex = (amp: any) => {
  const re = amp.re
  const im = amp.im
  
  if (Math.abs(im) < 0.001) {
    return re.toFixed(3)
  }
  
  if (Math.abs(re) < 0.001) {
    return `${im.toFixed(3)}i`
  }
  
  const sign = im >= 0 ? '+' : ''
  return `${re.toFixed(3)}${sign}${im.toFixed(3)}i`
}

// Wait for Q5M to load and initialize
const initQuantumDemo = () => {
  const checkQ5M = () => {
    if (typeof window !== 'undefined' && window.Q5M) {
      createQuantumState()
      nextTick(() => {
        if (canvas.value) {
          animate()
        }
      })
    } else {
      setTimeout(checkQ5M, 100)
    }
  }
  checkQ5M()
}

// Initialize when component mounts
onMounted(() => {
  initQuantumDemo()
})

// Cleanup on unmount
onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
})
</script>

<style scoped>
.interference-visualization {
  margin-bottom: 20px;
}

.card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #fff;
  font-size: 1.3rem;
}

.control-panel {
  display: grid;
  gap: 20px;
}

.experiment-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

button {
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

button.active {
  background: linear-gradient(45deg, #ff6b6b, #ff5252);
}

.parameter-controls {
  display: grid;
  gap: 15px;
}

.control-group {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  align-items: center;
  gap: 15px;
}

.control-group label {
  font-weight: bold;
  color: #fff;
}

.control-group input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  outline: none;
}

.control-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: #4CAF50;
  border-radius: 50%;
  cursor: pointer;
}

.value-display {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #81C784;
  min-width: 80px;
}

.visualization-area {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.canvas-container {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 15px;
}

.interference-canvas {
  width: 100%;
  height: auto;
  border-radius: 8px;
  display: block;
}

.wave-legend {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.legend-color {
  width: 20px;
  height: 3px;
  border-radius: 2px;
}

.legend-color.wave1 {
  background: rgba(76, 175, 80, 0.8);
}

.legend-color.wave2 {
  background: rgba(156, 39, 176, 0.8);
}

.legend-color.interference {
  background: rgba(255, 255, 255, 1);
  height: 4px;
}

.quantum-analysis {
  display: grid;
  gap: 20px;
}

.state-info {
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 10px;
}

.info-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  margin-bottom: 10px;
  align-items: start;
}

.info-row strong {
  color: #81C784;
  white-space: nowrap;
}

.wave-function,
.interference-condition {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  word-break: break-all;
}

.probabilities-display h4,
.amplitudes-display h4 {
  margin-bottom: 10px;
  color: #fff;
  font-size: 1.1rem;
}

.prob-bars {
  display: grid;
  gap: 10px;
}

.prob-bar {
  display: grid;
  grid-template-columns: 60px 1fr 60px;
  align-items: center;
  gap: 10px;
}

.bar-label {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 14px;
}

.bar-container {
  background: rgba(255, 255, 255, 0.2);
  height: 20px;
  border-radius: 10px;
  overflow: hidden;
}

.bar {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #81C784);
  border-radius: 10px;
  transition: width 0.5s ease;
}

.bar-value {
  text-align: right;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 12px;
}

.amplitude-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
}

.amplitude-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.state-label {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #81C784;
  margin-bottom: 8px;
}

.amplitude-value {
  font-size: 12px;
}

.complex-number {
  font-family: 'Courier New', monospace;
  color: #fff;
  margin-bottom: 4px;
}

.magnitude,
.phase {
  font-family: 'Courier New', monospace;
  opacity: 0.8;
  font-size: 11px;
}

.experiment-description {
  margin-top: 20px;
}

.experiment-text {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.physics-insights h4 {
  margin-bottom: 15px;
  color: #81C784;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.insight-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
}

.insight-item strong {
  color: #81C784;
  margin-right: 8px;
}

@media (max-width: 768px) {
  .visualization-area {
    grid-template-columns: 1fr;
  }
  
  .control-group {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .experiment-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .prob-bar {
    grid-template-columns: 50px 1fr 50px;
  }
  
  .insights-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .experiment-buttons {
    grid-template-columns: 1fr;
  }
  
  .amplitude-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
