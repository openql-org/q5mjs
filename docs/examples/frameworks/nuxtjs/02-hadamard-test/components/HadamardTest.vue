<template>
<!-- SPDX-License-Identifier: MIT -->
<!-- SPDX-FileCopyrightText: Copyright 2025 OpenQL Project -->
  <div class="hadamard-test">
    <div class="card">
      <h3>⚙️ Control Panel</h3>
      <div class="controls">
        <div class="control-group">
          <label>Gate Type:</label>
          <select v-model="gateType" @change="runHadamardTest" :disabled="isRunning">
            <option value="z">Z Gate (π phase)</option>
            <option value="s">S Gate (π/2 phase)</option>
            <option value="t">T Gate (π/4 phase)</option>
            <option value="phase">Custom Phase</option>
          </select>
        </div>
        
        <div class="control-group" v-show="gateType === 'phase'">
          <label>Custom Phase (φ):</label>
          <input 
            type="range" 
            v-model="phase" 
            min="0" 
            max="6.283" 
            step="0.01" 
            @input="runHadamardTest"
            :disabled="isRunning"
          />
          <span class="phase-display">{{ phaseDisplay }}</span>
        </div>
        
        <div class="control-group">
          <button @click="runHadamardTest" :disabled="isRunning" class="run-button">
            {{ isRunning ? 'Running...' : 'Run Single Test' }}
          </button>
          <button @click="runMultipleMeasurements" :disabled="isRunning" class="run-button multiple">
            {{ isRunning ? 'Running...' : 'Run 1000 Measurements' }}
          </button>
        </div>
      </div>
    </div>

    <div class="results-display">
      <div class="card">
        <h3>📊 Measurement Results</h3>
        <div class="probability-bars">
          <div class="prob-bar">
            <div class="bar-label">P(|0⟩)</div>
            <div class="bar-container">
              <div 
                class="bar prob-0" 
                :style="{ width: (prob0 * 100) + '%' }"
              ></div>
            </div>
            <div class="bar-value">{{ (prob0 * 100).toFixed(1) }}%</div>
          </div>
          
          <div class="prob-bar">
            <div class="bar-label">P(|1⟩)</div>
            <div class="bar-container">
              <div 
                class="bar prob-1" 
                :style="{ width: (prob1 * 100) + '%' }"
              ></div>
            </div>
            <div class="bar-value">{{ (prob1 * 100).toFixed(1) }}%</div>
          </div>
        </div>
        
        <div class="measurement-info" v-show="!isRunning">
          <div class="info-item">
            <strong>Expected P(|0⟩):</strong> {{ expectedProb0 }}
          </div>
          <div class="info-item">
            <strong>Estimated Phase:</strong> {{ estimatedPhase }}
          </div>
          <div class="info-item">
            <strong>Phase Error:</strong> {{ phaseError }}
          </div>
        </div>
      </div>

      <div class="card">
        <h3>🔬 Circuit Analysis</h3>
        <div class="circuit-info">
          <div class="info-section">
            <h4>Gate Information</h4>
            <div class="gate-display">
              <div class="gate-symbol">{{ gateSymbol }}</div>
              <div class="gate-phase">Phase: {{ actualPhase }}</div>
            </div>
          </div>
          
          <div class="info-section">
            <h4>Circuit Diagram</h4>
            <div class="circuit-diagram">
              <div class="wire">
                <span class="qubit-label">|0⟩ ─</span>
                <span class="gate">H</span>
                <span class="wire-line">─●─</span>
                <span class="gate">H</span>
                <span class="wire-line">─</span>
                <span class="measurement">📊</span>
              </div>
              <div class="wire">
                <span class="qubit-label">|1⟩ ─</span>
                <span class="spacer"></span>
                <span class="controlled-gate">{{ gateSymbol }}</span>
                <span class="spacer"></span>
                <span class="wire-line">─</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h4>Phase Kickback</h4>
            <div class="phase-kickback">
              {{ phaseKickback }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card theory-section">
      <h3>📐 Mathematical Analysis</h3>
      <div class="theory-content">
        <div class="formula-section">
          <h4>Hadamard Test Formula</h4>
          <div class="formula">
            P(|0⟩) = (1 + cos(φ))/2
          </div>
          <p class="formula-explanation">
            Where φ is the phase of the eigenvalue e^(iφ) for eigenstate |ψ⟩
          </p>
        </div>
        
        <div class="formula-section">
          <h4>Phase Estimation</h4>
          <div class="formula">
            φ = arccos(2·P(|0⟩) - 1)
          </div>
          <p class="formula-explanation">
            Inverse formula to extract phase from measurement probability
          </p>
        </div>

        <div class="quantum-states">
          <h4>Quantum States</h4>
          <div class="state-evolution">
            <div class="state-step">
              <strong>Initial:</strong> |0⟩ ⊗ |1⟩
            </div>
            <div class="state-step">
              <strong>After H:</strong> |+⟩ ⊗ |1⟩ = (|0⟩ + |1⟩)/√2 ⊗ |1⟩
            </div>
            <div class="state-step">
              <strong>After CU:</strong> (|0⟩ ⊗ |1⟩ + e^(iφ)|1⟩ ⊗ |1⟩)/√2
            </div>
            <div class="state-step">
              <strong>Final H:</strong> ((1 + e^(iφ))|0⟩ + (1 - e^(iφ))|1⟩)/2 ⊗ |1⟩
            </div>
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
const phase = ref(1.57) // π/2 by default
const gateType = ref('phase')
const prob0 = ref(0.5)
const prob1 = ref(0.5)
const isRunning = ref(false)

// Computed properties
const phaseDisplay = computed(() => {
  const phaseValue = parseFloat(phase.value.toString())
  const piRatio = phaseValue / Math.PI
  
  if (Math.abs(piRatio - Math.round(piRatio)) < 0.01) {
    const roundedRatio = Math.round(piRatio)
    if (roundedRatio === 0) return '0'
    if (roundedRatio === 1) return 'π'
    if (roundedRatio === -1) return '-π'
    return `${roundedRatio}π`
  }
  
  if (Math.abs(piRatio - 0.5) < 0.01) return 'π/2'
  if (Math.abs(piRatio - -0.5) < 0.01) return '-π/2'
  if (Math.abs(piRatio - 1.5) < 0.01) return '3π/2'
  if (Math.abs(piRatio - 0.25) < 0.01) return 'π/4'
  if (Math.abs(piRatio - 0.75) < 0.01) return '3π/4'
  
  return `${phaseValue.toFixed(2)}`
})

const gateSymbol = computed(() => {
  switch (gateType.value) {
    case 'z': return 'Z'
    case 's': return 'S'
    case 't': return 'T'
    case 'phase': return 'φ'
    default: return 'U'
  }
})

const actualPhase = computed(() => {
  switch (gateType.value) {
    case 'z': return 'π'
    case 's': return 'π/2'
    case 't': return 'π/4'
    case 'phase': return phaseDisplay.value
    default: return '0'
  }
})

const expectedProb0 = computed(() => {
  let phaseValue: number
  switch (gateType.value) {
    case 'z': phaseValue = Math.PI; break
    case 's': phaseValue = Math.PI / 2; break
    case 't': phaseValue = Math.PI / 4; break
    case 'phase': phaseValue = parseFloat(phase.value.toString()); break
    default: phaseValue = 0
  }
  
  // For eigenstate |1⟩, the probability is (1 + cos(φ))/2
  const expected = (1 + Math.cos(phaseValue)) / 2
  return expected.toFixed(3)
})

const estimatedPhase = computed(() => {
  // Estimate phase from measurement probability
  // P(|0⟩) = (1 + cos(φ))/2, so φ = arccos(2*P(|0⟩) - 1)
  try {
    const phaseEst = Math.acos(2 * prob0.value - 1)
    const piRatio = phaseEst / Math.PI
    
    if (Math.abs(piRatio - 0.5) < 0.05) return 'π/2'
    if (Math.abs(piRatio - 0.25) < 0.05) return 'π/4'
    if (Math.abs(piRatio - 0.75) < 0.05) return '3π/4'
    if (Math.abs(piRatio - 1) < 0.05) return 'π'
    
    return `${phaseEst.toFixed(2)}`
  } catch (error) {
    return 'N/A'
  }
})

const phaseError = computed(() => {
  let truePhase: number
  switch (gateType.value) {
    case 'z': truePhase = Math.PI; break
    case 's': truePhase = Math.PI / 2; break
    case 't': truePhase = Math.PI / 4; break
    case 'phase': truePhase = parseFloat(phase.value.toString()); break
    default: truePhase = 0
  }
  
  try {
    const estimatedPhaseValue = Math.acos(2 * prob0.value - 1)
    const error = Math.abs(truePhase - estimatedPhaseValue)
    return `${error.toFixed(3)}`
  } catch (error) {
    return 'N/A'
  }
})

const phaseKickback = computed(() => {
  const phaseVal = parseFloat(phase.value.toString())
  if (Math.abs(phaseVal) < 0.01) return 'None'
  return `Phase e^(i${phaseDisplay.value}) → Control`
})

// Methods
const runHadamardTest = async () => {
  if (typeof window === 'undefined' || !window.Q5M) return
  
  try {
    // Create 2-qubit circuit: ancilla + target
    const circuit = new window.Q5M.Circuit(2)
    
    // Prepare target qubit in eigenstate |1⟩
    circuit.x(1)
    
    // Hadamard on ancilla (qubit 0) 
    circuit.h(0)
    
    // Apply controlled gate based on selection
    switch (gateType.value) {
      case 'z':
        circuit.cz(0, 1)
        break
      case 's':
        circuit.cs(0, 1)
        break
      case 't':
        circuit.ct(0, 1)
        break
      case 'phase':
        circuit.cp(0, 1, parseFloat(phase.value.toString()))
        break
    }
    
    // Final Hadamard on ancilla
    circuit.h(0)
    
    // Execute and get probabilities
    const result = circuit.execute()
    const probabilities = result.state.probabilities()
    
    // Extract ancilla measurement probabilities
    // |00⟩ and |01⟩ correspond to ancilla in |0⟩
    // |10⟩ and |11⟩ correspond to ancilla in |1⟩  
    const p0 = probabilities[0] + probabilities[1] // |0⟩ on ancilla
    const p1 = probabilities[2] + probabilities[3] // |1⟩ on ancilla
    
    prob0.value = p0
    prob1.value = p1
    
  } catch (error) {
    console.error('Hadamard test error:', error)
  }
}

const runMultipleMeasurements = async () => {
  if (typeof window === 'undefined' || !window.Q5M) return
  
  isRunning.value = true
  
  let totalZeros = 0
  const numMeasurements = 1000
  
  for (let i = 0; i < numMeasurements; i++) {
    try {
      // Simulate individual measurements
      const circuit = new window.Q5M.Circuit(2)
      
      // Prepare target in |1⟩
      circuit.x(1)
      
      // Hadamard test protocol
      circuit.h(0)
      
      switch (gateType.value) {
        case 'z': circuit.cz(0, 1); break
        case 's': circuit.cs(0, 1); break
        case 't': circuit.ct(0, 1); break
        case 'phase': circuit.cp(0, 1, parseFloat(phase.value.toString())); break
      }
      
      circuit.h(0)
      
      // Measure ancilla qubit
      const result = circuit.execute()
      const measurement = result.state.measure([0])
      
      if (measurement[0] === 0) totalZeros++
      
      // Update display periodically
      if (i % 100 === 0) {
        prob0.value = totalZeros / (i + 1)
        prob1.value = 1 - prob0.value
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    } catch (error) {
      console.error('Measurement error:', error)
    }
  }
  
  // Final update
  prob0.value = totalZeros / numMeasurements
  prob1.value = 1 - prob0.value
  
  isRunning.value = false
}

// Wait for Q5M to load and initialize
const initQuantumDemo = () => {
  const checkQ5M = () => {
    if (typeof window !== 'undefined' && window.Q5M) {
      runHadamardTest()
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
</script>

<style scoped>
.hadamard-test {
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

.controls {
  display: grid;
  gap: 20px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  font-weight: bold;
  color: #fff;
}

.control-group select,
.control-group input[type="range"] {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
}

.control-group select option {
  background: #333;
  color: white;
}

.phase-display {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #81C784;
}

.run-button {
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
  margin: 5px 0;
}

.run-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.run-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.run-button.multiple {
  background: linear-gradient(45deg, #2196F3, #1976D2);
}

.results-display {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.probability-bars {
  margin-bottom: 20px;
}

.prob-bar {
  display: grid;
  grid-template-columns: 80px 1fr 80px;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.bar-label {
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.bar-container {
  background: rgba(255, 255, 255, 0.2);
  height: 25px;
  border-radius: 12px;
  overflow: hidden;
}

.bar {
  height: 100%;
  border-radius: 12px;
  transition: width 0.5s ease;
}

.bar.prob-0 {
  background: linear-gradient(90deg, #4CAF50, #81C784);
}

.bar.prob-1 {
  background: linear-gradient(90deg, #ff6b6b, #ff8a80);
}

.bar-value {
  text-align: right;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.measurement-info {
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 10px;
  font-family: 'Courier New', monospace;
}

.info-item {
  margin-bottom: 8px;
  font-size: 14px;
}

.circuit-info {
  display: grid;
  gap: 20px;
}

.info-section h4 {
  margin-bottom: 10px;
  color: #fff;
  font-size: 1.1rem;
}

.gate-display {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 8px;
}

.gate-symbol {
  font-family: 'Courier New', monospace;
  font-size: 24px;
  font-weight: bold;
  color: #81C784;
  border: 2px solid #81C784;
  border-radius: 6px;
  padding: 8px 12px;
  min-width: 50px;
  text-align: center;
}

.gate-phase {
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

.circuit-diagram {
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
}

.wire {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
}

.qubit-label {
  width: 60px;
}

.gate, .controlled-gate {
  background: #4CAF50;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  margin: 0 5px;
  font-weight: bold;
  min-width: 30px;
  text-align: center;
}

.controlled-gate {
  background: #2196F3;
}

.wire-line {
  padding: 0 10px;
}

.spacer {
  width: 38px;
}

.measurement {
  font-size: 16px;
}

.phase-kickback {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  text-align: center;
}

.theory-section {
  margin-top: 20px;
}

.theory-content {
  display: grid;
  gap: 25px;
}

.formula-section {
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 10px;
}

.formula-section h4 {
  margin-bottom: 15px;
  color: #fff;
}

.formula {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 18px;
  text-align: center;
  color: #81C784;
  font-weight: bold;
  margin-bottom: 10px;
}

.formula-explanation {
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.5;
  margin: 0;
}

.quantum-states h4 {
  margin-bottom: 15px;
  color: #fff;
}

.state-evolution {
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 10px;
}

.state-step {
  margin-bottom: 12px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.state-step strong {
  color: #81C784;
  margin-right: 10px;
}

@media (max-width: 768px) {
  .results-display {
    grid-template-columns: 1fr;
  }
  
  .prob-bar {
    grid-template-columns: 60px 1fr 60px;
    gap: 10px;
  }
  
  .gate-display {
    flex-direction: column;
    text-align: center;
  }
  
  .circuit-diagram {
    font-size: 12px;
  }
  
  .wire {
    flex-wrap: wrap;
  }
}
</style>
