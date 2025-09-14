<template>
<!-- SPDX-License-Identifier: MIT -->
<!-- SPDX-FileCopyrightText: Copyright 2025 OpenQL Project -->
  <div class="entanglement-demo">
    <div class="card">
      <h3>🎯 Create Entangled States</h3>
      <div class="controls">
        <button 
          @click="createBellState" 
          :class="{ active: currentState === 'bell' }"
          :disabled="isLoading"
        >
          Bell State |Φ⁺⟩
        </button>
        <button 
          @click="createBellStateMinus" 
          :class="{ active: currentState === 'bell-' }"
          :disabled="isLoading"
        >
          Bell State |Φ⁻⟩
        </button>
        <button 
          @click="createGHZState" 
          :class="{ active: currentState === 'ghz' }"
          :disabled="isLoading"
        >
          GHZ State (3 qubits)
        </button>
        <button 
          @click="createWState" 
          :class="{ active: currentState === 'w' }"
          :disabled="isLoading"
        >
          W State (3 qubits)
        </button>
        <button 
          @click="resetState" 
          :class="{ active: currentState === 'reset' }"
          :disabled="isLoading"
        >
          Reset |000⟩
        </button>
      </div>
    </div>

    <div class="state-display">
      <div class="card">
        <h3>📊 Measurement Probabilities</h3>
        <div v-if="isLoading" class="loading-text">
          Computing quantum state...
        </div>
        <div v-else class="probabilities">
          <div 
            v-for="(prob, index) in probabilities" 
            :key="index" 
            class="probability-bar"
          >
            <div 
              class="bar" 
              :style="{ height: Math.max(prob * 200, 5) + 'px' }"
            ></div>
            <div class="state-label">
              |{{ index.toString(2).padStart(numQubits, '0') }}⟩
            </div>
            <div class="probability-value">
              {{ (prob * 100).toFixed(1) }}%
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>🌊 Quantum Amplitudes</h3>
        <div v-if="isLoading" class="loading-text">
          Computing amplitudes...
        </div>
        <div v-else class="amplitude-display">
          <div 
            v-for="(amp, index) in filteredAmplitudes" 
            :key="index" 
            class="amplitude"
          >
            <div class="state-label">
              |{{ index.toString(2).padStart(numQubits, '0') }}⟩
            </div>
            <div class="complex-num">
              {{ formatComplex(amp) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>ℹ️ State Information</h3>
      <div class="state-info">
        <div><strong>Current State:</strong> {{ stateDescription }}</div>
        <div><strong>Number of Qubits:</strong> {{ numQubits }}</div>
        <div><strong>Entanglement:</strong> {{ entanglementInfo }}</div>
        <div><strong>Schmidt Rank:</strong> {{ schmidtRank }}</div>
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
const circuit = ref<any>(null)
const quantumState = ref<any>(null)
const currentState = ref('reset')
const numQubits = ref(3)
const isLoading = ref(false)

// Computed properties
const probabilities = computed(() => {
  if (!quantumState.value) return []
  try {
    return quantumState.value.probabilities()
  } catch (error) {
    console.error('Error computing probabilities:', error)
    return []
  }
})

const amplitudes = computed(() => {
  if (!quantumState.value) return []
  try {
    return quantumState.value.amplitudes()
  } catch (error) {
    console.error('Error computing amplitudes:', error)
    return []
  }
})

const filteredAmplitudes = computed(() => {
  return amplitudes.value.filter((amp: any, index: number) => {
    return amp && (Math.abs(amp.re) > 0.01 || Math.abs(amp.im) > 0.01)
  }).map((amp: any, originalIndex: number) => {
    // Find the original index for the label
    let actualIndex = 0
    let count = 0
    for (let i = 0; i < amplitudes.value.length; i++) {
      const a = amplitudes.value[i]
      if (a && (Math.abs(a.re) > 0.01 || Math.abs(a.im) > 0.01)) {
        if (count === originalIndex) {
          actualIndex = i
          break
        }
        count++
      }
    }
    return { ...amp, index: actualIndex }
  })
})

const stateDescription = computed(() => {
  switch (currentState.value) {
    case 'bell':
      return 'Bell State |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 - Maximally entangled 2-qubit state'
    case 'bell-':
      return 'Bell State |Φ⁻⟩ = (|00⟩ - |11⟩)/√2 - Maximally entangled with phase'
    case 'ghz':
      return 'GHZ State = (|000⟩ + |111⟩)/√2 - 3-qubit entangled state'
    case 'w':
      return 'W State = (|001⟩ + |010⟩ + |100⟩)/√3 - Symmetric 3-qubit state'
    case 'reset':
      return 'Ground State |000⟩ - No entanglement'
    default:
      return 'Custom quantum state'
  }
})

const entanglementInfo = computed(() => {
  switch (currentState.value) {
    case 'bell':
    case 'bell-':
      return 'Maximally entangled (2 qubits)'
    case 'ghz':
      return 'Maximal 3-qubit entanglement'
    case 'w':
      return 'Partial 3-qubit entanglement'
    case 'reset':
      return 'No entanglement (separable state)'
    default:
      return 'Analysis required'
  }
})

const schmidtRank = computed(() => {
  switch (currentState.value) {
    case 'bell':
    case 'bell-':
    case 'ghz':
      return '2 (maximal entanglement)'
    case 'w':
      return '2 (partial entanglement)'
    case 'reset':
      return '1 (no entanglement)'
    default:
      return 'Variable'
  }
})

// Methods
const initCircuit = async () => {
  if (typeof window === 'undefined' || !window.Q5M) return
  
  try {
    circuit.value = new window.Q5M.Circuit(numQubits.value)
    await executeCircuit()
  } catch (error) {
    console.error('Circuit initialization error:', error)
  }
}

const executeCircuit = async () => {
  if (!circuit.value) return
  
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 100)) // Small delay for UI
    const result = circuit.value.execute()
    quantumState.value = result.state
  } catch (error) {
    console.error('Circuit execution error:', error)
  } finally {
    isLoading.value = false
  }
}

// State creation methods
const createBellState = async () => {
  if (typeof window === 'undefined' || !window.Q5M) return
  
  circuit.value = new window.Q5M.Circuit(2)
  numQubits.value = 2
  
  // Create Bell state: H(0) CNOT(0,1)
  circuit.value.h(0).cnot(0, 1)
  
  currentState.value = 'bell'
  await executeCircuit()
}

const createBellStateMinus = async () => {
  if (typeof window === 'undefined' || !window.Q5M) return
  
  circuit.value = new window.Q5M.Circuit(2)
  numQubits.value = 2
  
  // Create Bell state with phase: X(0) H(0) CNOT(0,1)
  circuit.value.x(0).h(0).cnot(0, 1)
  
  currentState.value = 'bell-'
  await executeCircuit()
}

const createGHZState = async () => {
  if (typeof window === 'undefined' || !window.Q5M) return
  
  circuit.value = new window.Q5M.Circuit(3)
  numQubits.value = 3
  
  // Create GHZ state: H(0) CNOT(0,1) CNOT(0,2)
  circuit.value.h(0).cnot(0, 1).cnot(0, 2)
  
  currentState.value = 'ghz'
  await executeCircuit()
}

const createWState = async () => {
  if (typeof window === 'undefined' || !window.Q5M) return
  
  circuit.value = new window.Q5M.Circuit(3)
  numQubits.value = 3
  
  // Create W state using rotation gates
  circuit.value
    .ry(0, Math.acos(Math.sqrt(2/3)))  // Rotate first qubit
    .cnot(0, 1)
    .x(0)  
    .cry(1, 2, Math.acos(Math.sqrt(1/2)))  // Controlled rotation on third qubit
    .cnot(0, 1)
  
  currentState.value = 'w'
  await executeCircuit()
}

const resetState = async () => {
  if (typeof window === 'undefined' || !window.Q5M) return
  
  circuit.value = new window.Q5M.Circuit(3)
  numQubits.value = 3
  
  currentState.value = 'reset'
  await executeCircuit()
}

// Utility functions
const formatComplex = (complex: any) => {
  if (!complex) return '0'
  
  const re = complex.re
  const im = complex.im
  
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
      initCircuit()
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
.entanglement-demo {
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

button {
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button.active {
  background: linear-gradient(45deg, #ff6b6b, #ff5252);
}

.state-display {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.probabilities {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 10px;
}

.probability-bar {
  text-align: center;
}

.bar {
  background: linear-gradient(to top, #4CAF50, #81C784);
  border-radius: 4px;
  transition: height 0.5s ease;
  margin: 5px 0;
  min-height: 5px;
}

.state-label {
  font-size: 12px;
  margin: 5px 0;
}

.probability-value {
  font-size: 11px;
  opacity: 0.8;
}

.amplitude-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.amplitude {
  background: rgba(255,255,255,0.1);
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  font-size: 12px;
}

.complex-num {
  color: #81C784;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.state-info {
  background: rgba(0,0,0,0.3);
  padding: 15px;
  border-radius: 10px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.state-info div {
  margin-bottom: 8px;
}

.loading-text {
  text-align: center;
  padding: 20px;
  opacity: 0.8;
  font-style: italic;
}

@media (max-width: 768px) {
  .state-display {
    grid-template-columns: 1fr;
  }
  
  .controls {
    grid-template-columns: 1fr;
  }
  
  .probabilities {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .amplitude-display {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
