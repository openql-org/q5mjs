// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
const { createApp, ref, computed } = Vue;

createApp({
    setup() {
        // Reactive state
        const phase = ref(1.57); // π/2 by default
        const gateType = ref('phase');
        const prob0 = ref(0.5);
        const prob1 = ref(0.5);
        const isRunning = ref(false);
        const measurementResults = ref([]);

        // Computed properties
        const phaseDisplay = computed(() => {
            const phaseValue = parseFloat(phase.value);
            const piRatio = phaseValue / Math.PI;
            
            if (Math.abs(piRatio - Math.round(piRatio)) < 0.01) {
                const roundedRatio = Math.round(piRatio);
                if (roundedRatio === 0) return '0';
                if (roundedRatio === 1) return 'π';
                if (roundedRatio === -1) return '-π';
                return `${roundedRatio}π`;
            }
            
            if (Math.abs(piRatio - 0.5) < 0.01) return 'π/2';
            if (Math.abs(piRatio - -0.5) < 0.01) return '-π/2';
            if (Math.abs(piRatio - 1.5) < 0.01) return '3π/2';
            if (Math.abs(piRatio - 0.25) < 0.01) return 'π/4';
            if (Math.abs(piRatio - 0.75) < 0.01) return '3π/4';
            
            return `${phaseValue.toFixed(2)}`;
        });

        const gateSymbol = computed(() => {
            switch (gateType.value) {
                case 'z': return 'Z';
                case 's': return 'S';
                case 't': return 'T';
                case 'phase': return 'φ';
                default: return 'U';
            }
        });

        const actualPhase = computed(() => {
            switch (gateType.value) {
                case 'z': return 'π';
                case 's': return 'π/2';
                case 't': return 'π/4';
                case 'phase': return phaseDisplay.value;
                default: return '0';
            }
        });

        const expectedProb0 = computed(() => {
            let phaseValue;
            switch (gateType.value) {
                case 'z': phaseValue = Math.PI; break;
                case 's': phaseValue = Math.PI / 2; break;
                case 't': phaseValue = Math.PI / 4; break;
                case 'phase': phaseValue = parseFloat(phase.value); break;
                default: phaseValue = 0;
            }
            
            // For eigenstate |1⟩, the probability is (1 + cos(φ))/2
            const expected = (1 + Math.cos(phaseValue)) / 2;
            return expected.toFixed(3);
        });

        const estimatedPhase = computed(() => {
            // Estimate phase from measurement probability
            // P(|0⟩) = (1 + cos(φ))/2, so φ = arccos(2*P(|0⟩) - 1)
            const phaseEst = Math.acos(2 * prob0.value - 1);
            const piRatio = phaseEst / Math.PI;
            
            if (Math.abs(piRatio - 0.5) < 0.05) return 'π/2';
            if (Math.abs(piRatio - 0.25) < 0.05) return 'π/4';
            if (Math.abs(piRatio - 0.75) < 0.05) return '3π/4';
            if (Math.abs(piRatio - 1) < 0.05) return 'π';
            
            return `${phaseEst.toFixed(2)}`;
        });

        const phaseError = computed(() => {
            let truePhase;
            switch (gateType.value) {
                case 'z': truePhase = Math.PI; break;
                case 's': truePhase = Math.PI / 2; break;
                case 't': truePhase = Math.PI / 4; break;
                case 'phase': truePhase = parseFloat(phase.value); break;
                default: truePhase = 0;
            }
            
            const estimatedPhaseValue = Math.acos(2 * prob0.value - 1);
            const error = Math.abs(truePhase - estimatedPhaseValue);
            return `${error.toFixed(3)}`;
        });

        const phaseKickback = computed(() => {
            const phaseVal = parseFloat(phase.value);
            if (Math.abs(phaseVal) < 0.01) return 'None';
            return `Phase e^(i${phaseDisplay.value}) → Control`;
        });

        // Methods
        const runHadamardTest = () => {
            try {
                // Create 2-qubit circuit: ancilla + target
                const circuit = new Q5M.Circuit(2);
                
                // Prepare target qubit in eigenstate |1⟩
                circuit.x(1);
                
                // Hadamard on ancilla (qubit 0) 
                circuit.h(0);
                
                // Apply controlled gate based on selection
                switch (gateType.value) {
                    case 'z':
                        circuit.cz(0, 1);
                        break;
                    case 's':
                        // Controlled-S gate using CP with phi=π/2
                        circuit.cp(0, 1, Math.PI / 2);
                        break;
                    case 't':
                        // Controlled-T gate using CP with phi=π/4
                        circuit.cp(0, 1, Math.PI / 4);
                        break;
                    case 'phase':
                        circuit.cp(0, 1, parseFloat(phase.value));
                        break;
                }
                
                // Final Hadamard on ancilla
                circuit.h(0);
                
                // Execute and get probabilities
                const result = circuit.execute();
                const probabilities = result.state.probabilities();
                
                // Extract ancilla measurement probabilities
                // |00⟩ and |01⟩ correspond to ancilla in |0⟩
                // |10⟩ and |11⟩ correspond to ancilla in |1⟩  
                const p0 = probabilities[0] + probabilities[1]; // |0⟩ on ancilla
                const p1 = probabilities[2] + probabilities[3]; // |1⟩ on ancilla
                
                prob0.value = p0;
                prob1.value = p1;
                
            } catch (error) {
                console.error('Hadamard test error:', error);
            }
        };

        const runMultipleMeasurements = async () => {
            isRunning.value = true;
            measurementResults.value = [];
            
            let totalZeros = 0;
            const numMeasurements = 1000;
            
            for (let i = 0; i < numMeasurements; i++) {
                // Simulate individual measurements
                const circuit = new Q5M.Circuit(2);
                
                // Prepare target in |1⟩
                circuit.x(1);
                
                // Hadamard test protocol
                circuit.h(0);
                
                switch (gateType.value) {
                    case 'z': circuit.cz(0, 1); break;
                    case 's': circuit.cp(0, 1, Math.PI / 2); break; // CS = CP(π/2)
                    case 't': circuit.cp(0, 1, Math.PI / 4); break; // CT = CP(π/4)
                    case 'phase': circuit.cp(0, 1, parseFloat(phase.value)); break;
                }
                
                circuit.h(0);
                
                // Execute and get probabilities to simulate measurement
                const result = circuit.execute();
                const probabilities = result.state.probabilities();
                
                // Simulate measurement of ancilla qubit
                // |00⟩ and |01⟩ correspond to ancilla in |0⟩
                const p0 = probabilities[0] + probabilities[1];
                
                // Randomly sample based on probability
                if (Math.random() < p0) totalZeros++;
                
                // Update display periodically
                if (i % 100 === 0) {
                    prob0.value = totalZeros / (i + 1);
                    prob1.value = 1 - prob0.value;
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            }
            
            // Final update
            prob0.value = totalZeros / numMeasurements;
            prob1.value = 1 - prob0.value;
            
            isRunning.value = false;
        };

        // Initialize
        runHadamardTest();

        return {
            phase,
            gateType,
            prob0,
            prob1,
            isRunning,
            phaseDisplay,
            gateSymbol,
            actualPhase,
            expectedProb0,
            estimatedPhase,
            phaseError,
            phaseKickback,
            runHadamardTest,
            runMultipleMeasurements
        };
    }
}).mount('#app');
