// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
const { createApp, ref, computed, reactive } = Vue;

createApp({
    setup() {
        // Reactive state
        const circuit = ref(null);
        const quantumState = ref(null);
        const currentState = ref('reset');
        const numQubits = ref(3);
        
        // Initialize quantum circuit
        const initCircuit = () => {
            circuit.value = new Q5M.Circuit(numQubits.value);
            executeCircuit();
        };

        // Execute circuit and get quantum state
        const executeCircuit = () => {
            try {
                const result = circuit.value.execute();
                quantumState.value = result.state;
            } catch (error) {
                console.error('Circuit execution error:', error);
            }
        };

        // Computed properties
        const probabilities = computed(() => {
            if (!quantumState.value) return [];
            return quantumState.value.probabilities();
        });

        const amplitudes = computed(() => {
            if (!quantumState.value) return [];
            const amps = quantumState.value.amplitudes();
            // Ensure each amplitude has valid re and im properties
            return amps.map(amp => {
                if (!amp) return { re: 0, im: 0 };
                return amp;
            });
        });

        const stateDescription = computed(() => {
            switch (currentState.value) {
                case 'bell':
                    return 'Bell State |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 - Maximally entangled 2-qubit state';
                case 'bell-':
                    return 'Bell State |Φ⁻⟩ = (|00⟩ - |11⟩)/√2 - Maximally entangled with phase';
                case 'ghz':
                    return 'GHZ State = (|000⟩ + |111⟩)/√2 - 3-qubit entangled state';
                case 'w':
                    return 'W State = (|001⟩ + |010⟩ + |100⟩)/√3 - Symmetric 3-qubit state';
                case 'reset':
                    return 'Ground State |000⟩ - No entanglement';
                default:
                    return 'Custom quantum state';
            }
        });

        const entanglementInfo = computed(() => {
            switch (currentState.value) {
                case 'bell':
                case 'bell-':
                    return 'Maximally entangled (2 qubits)';
                case 'ghz':
                    return 'Maximal 3-qubit entanglement';
                case 'w':
                    return 'Partial 3-qubit entanglement';
                case 'reset':
                    return 'No entanglement (separable state)';
                default:
                    return 'Analysis required';
            }
        });

        const schmidtRank = computed(() => {
            switch (currentState.value) {
                case 'bell':
                case 'bell-':
                case 'ghz':
                    return '2 (maximal entanglement)';
                case 'w':
                    return '2 (partial entanglement)';
                case 'reset':
                    return '1 (no entanglement)';
                default:
                    return 'Variable';
            }
        });

        // State creation methods
        const createBellState = () => {
            circuit.value = new Q5M.Circuit(2);
            numQubits.value = 2;
            
            // Create Bell state: H(0) CNOT(0,1)
            circuit.value.h(0).cnot(0, 1);
            
            currentState.value = 'bell';
            executeCircuit();
        };

        const createBellStateMinus = () => {
            circuit.value = new Q5M.Circuit(2);
            numQubits.value = 2;
            
            // Create Bell state with phase: X(0) H(0) CNOT(0,1)
            circuit.value.x(0).h(0).cnot(0, 1);
            
            currentState.value = 'bell-';
            executeCircuit();
        };

        const createGHZState = () => {
            circuit.value = new Q5M.Circuit(3);
            numQubits.value = 3;
            
            // Create GHZ state: H(0) CNOT(0,1) CNOT(0,2)
            circuit.value.h(0).cnot(0, 1).cnot(0, 2);
            
            currentState.value = 'ghz';
            executeCircuit();
        };

        const createWState = () => {
            circuit.value = new Q5M.Circuit(3);
            numQubits.value = 3;
            
            // Create W state approximation
            // W state = (|001⟩ + |010⟩ + |100⟩)/√3
            // Using partial rotations and CNOTs
            circuit.value
                .ry(0, 2 * Math.acos(Math.sqrt(2/3)))  // Rotate first qubit
                .cnot(0, 1)  // Entangle with second qubit
                .x(0)  // Flip first qubit
                .cnot(1, 2)  // Entangle second with third
                .cnot(0, 1);  // Additional entanglement
            
            currentState.value = 'w';
            executeCircuit();
        };

        const resetState = () => {
            circuit.value = new Q5M.Circuit(3);
            numQubits.value = 3;
            
            currentState.value = 'reset';
            executeCircuit();
        };

        // Utility functions
        const formatComplex = (complex) => {
            if (!complex) return '0';
            
            const re = complex.re;
            const im = complex.im;
            
            if (Math.abs(im) < 0.001) {
                return re.toFixed(3);
            }
            
            if (Math.abs(re) < 0.001) {
                return `${im.toFixed(3)}i`;
            }
            
            const sign = im >= 0 ? '+' : '';
            return `${re.toFixed(3)}${sign}${im.toFixed(3)}i`;
        };

        // Initialize on mount
        initCircuit();

        return {
            circuit,
            quantumState,
            currentState,
            numQubits,
            probabilities,
            amplitudes,
            stateDescription,
            entanglementInfo,
            schmidtRank,
            createBellState,
            createBellStateMinus,
            createGHZState,
            createWState,
            resetState,
            formatComplex
        };
    }
}).mount('#app');
