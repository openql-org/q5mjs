// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
const { createApp, ref, computed, onMounted, nextTick } = Vue;

createApp({
    setup() {
        // Reactive state
        const relativePhase = ref(0);
        const amplitudeRatio = ref(0.7);
        const animationSpeed = ref(1.5);
        const currentExperiment = ref('constructive');
        const numQubits = ref(1);
        const quantumState = ref(null);
        const canvas = ref(null);
        const animationId = ref(null);
        const time = ref(0);

        // Computed properties
        const phaseDisplay = computed(() => {
            const phase = parseFloat(relativePhase.value);
            const piRatio = phase / Math.PI;
            
            if (Math.abs(piRatio) < 0.01) return '0';
            if (Math.abs(piRatio - 1) < 0.05) return 'π';
            if (Math.abs(piRatio - 2) < 0.05) return '2π';
            if (Math.abs(piRatio - 0.5) < 0.05) return 'π/2';
            if (Math.abs(piRatio - 1.5) < 0.05) return '3π/2';
            
            return `${phase.toFixed(2)}`;
        });

        const probabilities = computed(() => {
            if (!quantumState.value) return [];
            return quantumState.value.probabilities();
        });

        const displayAmplitudes = computed(() => {
            if (!quantumState.value) return [];
            const amps = quantumState.value.amplitudes();
            
            if (!amps || !Array.isArray(amps)) return [];
            
            return amps.map(amp => {
                if (!amp) return { magnitude: 0, phase: 0, re: 0, im: 0 };
                
                const magnitude = Math.sqrt(amp.re * amp.re + amp.im * amp.im);
                const phase = Math.atan2(amp.im, amp.re);
                
                return {
                    magnitude,
                    phase,
                    re: amp.re || 0,
                    im: amp.im || 0
                };
            });
        });

        const experimentTitle = computed(() => {
            switch (currentExperiment.value) {
                case 'constructive': return '🌊 Constructive Interference';
                case 'destructive': return '🌊 Destructive Interference';
                case 'mixed': return '🌊 Mixed Interference';
                case 'spinning': return '🔄 Spinning Quantum State';
                case 'equal': return '⚖️ Equal Superposition';
                default: return 'Quantum Interference';
            }
        });

        const experimentDescription = computed(() => {
            switch (currentExperiment.value) {
                case 'constructive':
                    return 'Phases align perfectly (0°) - amplitudes add up constructively. Maximum probability for certain outcomes. Like waves in perfect sync!';
                case 'destructive':
                    return 'Phases are opposite (180°) - amplitudes cancel out destructively. Some outcomes become impossible. Like waves canceling each other!';
                case 'mixed':
                    return 'Phases at 90° - creates a mix of constructive and destructive interference. See how quantum probabilities change smoothly!';
                case 'spinning':
                    return 'Watch the quantum state rotate in real-time! The phase continuously changes, showing how interference varies dynamically.';
                case 'equal':
                    return 'Both amplitudes equal (50/50 superposition) - the classic quantum coin flip state. Adjust phase to see interference effects!';
                default:
                    return '';
            }
        });

        const waveFunction = computed(() => {
            const ratio = parseFloat(amplitudeRatio.value);
            const phase = phaseDisplay.value;
            
            const amp2 = Math.sqrt(1 - ratio * ratio);
            
            switch (currentExperiment.value) {
                case 'constructive':
                    return `|ψ⟩ = ${ratio.toFixed(2)}|0⟩ + ${amp2.toFixed(2)}|1⟩ (phases aligned!)`;
                case 'destructive':
                    return `|ψ⟩ = ${ratio.toFixed(2)}|0⟩ - ${amp2.toFixed(2)}|1⟩ (phases opposite!)`;
                case 'mixed':
                    return `|ψ⟩ = ${ratio.toFixed(2)}|0⟩ + ${amp2.toFixed(2)}i|1⟩ (90° phase shift)`;
                case 'spinning':
                    return `|ψ⟩ = ${ratio.toFixed(2)}|0⟩ + ${amp2.toFixed(2)}e^(i${phase})|1⟩ (rotating!)`;
                case 'equal':
                    return `|ψ⟩ = (1/√2)(|0⟩ + e^(i${phase})|1⟩) (perfect 50/50!)`;
                default:
                    return `|ψ⟩ = ${ratio.toFixed(2)}|0⟩ + ${amp2.toFixed(2)}e^(i${phase})|1⟩`;
            }
        });

        const interferenceCondition = computed(() => {
            switch (currentExperiment.value) {
                case 'constructive':
                    return 'Constructive: δ = 2nπ (phases align, amplitudes add)';
                case 'destructive':
                    return 'Destructive: δ = (2n+1)π (phases opposite, amplitudes cancel)';
                case 'mixed':
                    return 'Mixed: δ = π/2 or 3π/2 (partial interference)';
                case 'spinning':
                    return 'Time-varying: δ = ωt (continuous phase rotation)';
                case 'equal':
                    return 'P(|0⟩) = P(|1⟩) = 1/2 when δ = 0, varies with phase';
                default:
                    return 'P(|0⟩) = |α₀|², P(|1⟩) = |α₁|², with interference terms';
            }
        });

        // Methods
        const updateInterference = () => {
            createQuantumState();
            drawWavePattern();
        };

        const createQuantumState = () => {
            const circuit = new Q5M.Circuit(1);
            const ratio = parseFloat(amplitudeRatio.value);
            const phase = parseFloat(relativePhase.value);
            
            // Always create superposition state using current user parameters
            // This ensures sliders always control the probability display
            const theta = Math.acos(ratio);
            circuit.ry(0, 2 * theta);
            
            // Apply phase rotation if not zero
            if (Math.abs(phase) > 0.01) {
                circuit.rz(0, phase);
            }
            
            const result = circuit.execute();
            quantumState.value = result.state;
        };

        const drawWavePattern = () => {
            if (!canvas.value) return;
            
            const ctx = canvas.value.getContext('2d');
            const width = canvas.value.width;
            const height = canvas.value.height;
            
            // Clear canvas
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, width, height);
            
            // Draw interference pattern
            const centerY = height / 2;
            const amplitude1 = parseFloat(amplitudeRatio.value) * 50;
            const amplitude2 = Math.sqrt(1 - amplitudeRatio.value * amplitudeRatio.value) * 50;
            const phase = parseFloat(relativePhase.value);
            const timeOffset = time.value * parseFloat(animationSpeed.value);
            
            ctx.lineWidth = 2;
            
            // Draw wave 1
            ctx.strokeStyle = 'rgba(76, 175, 80, 0.8)';
            ctx.beginPath();
            for (let x = 0; x < width; x++) {
                const y1 = centerY + amplitude1 * Math.sin(0.02 * x + timeOffset);
                if (x === 0) ctx.moveTo(x, y1);
                else ctx.lineTo(x, y1);
            }
            ctx.stroke();
            
            // Draw wave 2
            ctx.strokeStyle = 'rgba(156, 39, 176, 0.8)';
            ctx.beginPath();
            for (let x = 0; x < width; x++) {
                const y2 = centerY + amplitude2 * Math.sin(0.02 * x + timeOffset + phase);
                if (x === 0) ctx.moveTo(x, y2);
                else ctx.lineTo(x, y2);
            }
            ctx.stroke();
            
            // Draw interference pattern
            ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let x = 0; x < width; x++) {
                const y1 = amplitude1 * Math.sin(0.02 * x + timeOffset);
                const y2 = amplitude2 * Math.sin(0.02 * x + timeOffset + phase);
                const yTotal = centerY + y1 + y2;
                if (x === 0) ctx.moveTo(x, yTotal);
                else ctx.lineTo(x, yTotal);
            }
            ctx.stroke();
            
            // Add labels
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = '12px monospace';
            ctx.fillText('Wave 1', 10, 20);
            ctx.fillText('Wave 2', 10, 35);
            ctx.fillText('Interference', 10, 50);
        };

        const animate = () => {
            time.value += 0.05;
            
            // Update phase for spinning state only
            if (currentExperiment.value === 'spinning') {
                const newPhase = (time.value * parseFloat(animationSpeed.value)) % (2 * Math.PI);
                relativePhase.value = newPhase;
                updateInterference();
            }
            
            drawWavePattern();
            animationId.value = requestAnimationFrame(animate);
        };

        // Experiment methods
        const constructiveInterference = () => {
            currentExperiment.value = 'constructive';
            numQubits.value = 1;
            relativePhase.value = 0; // 0 degrees - perfect alignment
            amplitudeRatio.value = 0.707; // Equal amplitudes
            updateInterference();
        };

        const destructiveInterference = () => {
            currentExperiment.value = 'destructive';
            numQubits.value = 1;
            relativePhase.value = Math.PI; // 180 degrees - opposite phases
            amplitudeRatio.value = 0.707; // Equal amplitudes
            updateInterference();
        };

        const mixedInterference = () => {
            currentExperiment.value = 'mixed';
            numQubits.value = 1;
            relativePhase.value = Math.PI / 2; // 90 degrees - mixed interference
            amplitudeRatio.value = 0.707; // Equal amplitudes
            updateInterference();
        };

        const spinningState = () => {
            currentExperiment.value = 'spinning';
            numQubits.value = 1;
            amplitudeRatio.value = 0.707; // Equal amplitudes
            relativePhase.value = 0; // Start from 0, animation will rotate it
            updateInterference();
        };

        const equalSuperposition = () => {
            currentExperiment.value = 'equal';
            numQubits.value = 1;
            amplitudeRatio.value = 0.707; // Exactly 50/50 superposition
            relativePhase.value = 0;
            updateInterference();
        };

        const formatComplex = (amp) => {
            const re = amp.re;
            const im = amp.im;
            
            if (Math.abs(im) < 0.001) {
                return re.toFixed(3);
            }
            
            if (Math.abs(re) < 0.001) {
                return `${im.toFixed(3)}i`;
            }
            
            const sign = im >= 0 ? '+' : '';
            return `${re.toFixed(3)}${sign}${im.toFixed(3)}i`;
        };

        // Lifecycle
        onMounted(async () => {
            await nextTick();
            if (canvas.value) {
                // Initialize with constructive interference
                constructiveInterference();
                animate();
            }
        });

        return {
            relativePhase,
            amplitudeRatio,
            animationSpeed,
            currentExperiment,
            numQubits,
            canvas,
            phaseDisplay,
            probabilities,
            displayAmplitudes,
            experimentTitle,
            experimentDescription,
            waveFunction,
            interferenceCondition,
            updateInterference,
            constructiveInterference,
            destructiveInterference,
            mixedInterference,
            spinningState,
            equalSuperposition,
            formatComplex
        };
    }
}).mount('#app');
