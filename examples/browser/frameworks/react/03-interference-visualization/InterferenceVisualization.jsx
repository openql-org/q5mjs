// SPDX-License-Identifier: MIT
// Copyright (c) 2024 OpenQL Project
// React component for Quantum Interference Visualization
// This file shows the JSX component structure for use in React projects

const { useState, useEffect, useRef, useCallback, useMemo } = React;

const InterferenceVisualization = () => {
    // State variables
    const [relativePhase, setRelativePhase] = useState(0);
    const [amplitudeRatio, setAmplitudeRatio] = useState(0.7);
    const [animationSpeed, setAnimationSpeed] = useState(1.5);
    const [currentExperiment, setCurrentExperiment] = useState('constructive');
    const [numQubits, setNumQubits] = useState(1);
    const [quantumState, setQuantumState] = useState(null);
    
    // Refs for canvas and animation
    const canvasRef = useRef(null);
    const animationIdRef = useRef(null);
    const timeRef = useRef(0);

    // Computed values
    const getPhaseDisplay = () => {
        const phase = parseFloat(relativePhase);
        const piRatio = phase / Math.PI;
        
        if (Math.abs(piRatio) < 0.01) return '0';
        if (Math.abs(piRatio - 1) < 0.05) return 'π';
        if (Math.abs(piRatio - 2) < 0.05) return '2π';
        if (Math.abs(piRatio - 0.5) < 0.05) return 'π/2';
        if (Math.abs(piRatio - 1.5) < 0.05) return '3π/2';
        
        return `${phase.toFixed(2)}`;
    };

    const getProbabilities = () => {
        if (!quantumState) return [];
        return quantumState.probabilities();
    };

    const getDisplayAmplitudes = () => {
        if (!quantumState) return [];
        const amps = quantumState.amplitudes();
        
        return amps.map(amp => {
            if (!amp) return { magnitude: 0, phase: 0, re: 0, im: 0 };
            
            const magnitude = Math.sqrt(amp.re * amp.re + amp.im * amp.im);
            const phase = Math.atan2(amp.im, amp.re);
            
            return {
                magnitude,
                phase,
                re: amp.re,
                im: amp.im
            };
        });
    };

    const getExperimentTitle = () => {
        switch (currentExperiment) {
            case 'constructive': return '🌊 Constructive Interference';
            case 'destructive': return '🌊 Destructive Interference';
            case 'mixed': return '🌊 Mixed Interference';
            case 'spinning': return '🔄 Spinning Quantum State';
            case 'equal': return '⚖️ Equal Superposition';
            default: return 'Quantum Interference';
        }
    };

    const getExperimentDescription = () => {
        switch (currentExperiment) {
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
    };

    const getWaveFunction = () => {
        const ratio = parseFloat(amplitudeRatio);
        const phase = getPhaseDisplay();
        const amp2 = Math.sqrt(1 - ratio * ratio);
        
        switch (currentExperiment) {
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
    };

    const getInterferenceCondition = () => {
        switch (currentExperiment) {
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
    };

    // Functions
    const createQuantumState = useCallback(() => {
        const circuit = new Q5M.Circuit(1);
        const ratio = parseFloat(amplitudeRatio);
        const phase = parseFloat(relativePhase);
        
        // Always create superposition state using current user parameters
        // This ensures sliders always control the amplitude analysis display
        const theta = Math.acos(ratio);
        circuit.ry(0, 2 * theta);
        
        // Apply phase rotation if not zero
        if (Math.abs(phase) > 0.01) {
            circuit.rz(0, phase);
        }
        
        
        const result = circuit.execute();
        setQuantumState(result.state);
    }, [currentExperiment, amplitudeRatio, relativePhase]);

    const drawWavePattern = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, width, height);
        
        // Draw interference pattern
        const centerY = height / 2;
        const amplitude1 = parseFloat(amplitudeRatio) * 50;
        const amplitude2 = Math.sqrt(1 - amplitudeRatio * amplitudeRatio) * 50;
        const phase = parseFloat(relativePhase);
        const timeOffset = timeRef.current * parseFloat(animationSpeed);
        
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
    }, [amplitudeRatio, relativePhase, animationSpeed]);

    // Remove the circular dependency by simplifying the callback chain

    // Experiment functions - simplified and more visual
    const constructiveInterference = () => {
        setCurrentExperiment('constructive');
        setNumQubits(1);
        setRelativePhase(0); // 0 degrees - perfect alignment
        setAmplitudeRatio(0.707); // Equal amplitudes
    };

    const destructiveInterference = () => {
        setCurrentExperiment('destructive');
        setNumQubits(1);
        setRelativePhase(Math.PI); // 180 degrees - opposite phases
        setAmplitudeRatio(0.707); // Equal amplitudes
    };

    const mixedInterference = () => {
        setCurrentExperiment('mixed');
        setNumQubits(1);
        setRelativePhase(Math.PI / 2); // 90 degrees - mixed interference
        setAmplitudeRatio(0.707); // Equal amplitudes
    };

    const spinningState = () => {
        setCurrentExperiment('spinning');
        setNumQubits(1);
        setAmplitudeRatio(0.707); // Equal amplitudes
        setRelativePhase(0); // Start from 0, animation will rotate it
        // Reset animation time
        timeRef.current = 0;
    };

    const equalSuperposition = () => {
        setCurrentExperiment('equal');
        setNumQubits(1);
        setAmplitudeRatio(0.707); // Exactly 50/50 superposition
        setRelativePhase(0);
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

    // Effects - Use the createQuantumState function which respects experiments
    useEffect(() => {
        if (typeof Q5M !== 'undefined') {
            createQuantumState();
            
            if (canvasRef.current) {
                drawWavePattern();
            }
        }
    }, [createQuantumState]);

    useEffect(() => {
        const animate = () => {
            timeRef.current += 0.05;
            
            // Update phase for spinning state only
            if (currentExperiment === 'spinning') {
                const newPhase = (timeRef.current * parseFloat(animationSpeed)) % (2 * Math.PI);
                setRelativePhase(newPhase);
            }
            
            if (canvasRef.current && currentExperiment !== 'spinning') {
                drawWavePattern();
            }
            
            animationIdRef.current = requestAnimationFrame(animate);
        };
        
        if (canvasRef.current) {
            animationIdRef.current = requestAnimationFrame(animate);
        }
        
        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
        };
    }, [currentExperiment, animationSpeed]);

    const probabilities = useMemo(() => {
        if (!quantumState) return [];
        return quantumState.probabilities();
    }, [quantumState]);
    
    const displayAmplitudes = useMemo(() => {
        if (!quantumState) return [];
        const amps = quantumState.amplitudes();
        
        const result = amps.map(amp => {
            if (!amp) return { magnitude: 0, phase: 0, re: 0, im: 0 };
            
            const magnitude = Math.sqrt(amp.re * amp.re + amp.im * amp.im);
            const phase = Math.atan2(amp.im, amp.re);
            
            return {
                magnitude,
                phase,
                re: amp.re,
                im: amp.im
            };
        });
        
        return result;
    }, [quantumState]);

    return (
        <div>
            <div className="header">
                <h1>🌊 Quantum Interference Visualization</h1>
                <p>Explore wave-particle duality and quantum superposition</p>
            </div>

            <div className="controls">
                <div className="card control-group">
                    <h3>🎛️ Wave Parameters</h3>
                    
                    <label><strong>Relative Phase (δ):</strong></label>
                    <div className="slider-container">
                        <input 
                            type="range" 
                            value={relativePhase}
                            onChange={(e) => {
                                const newPhase = parseFloat(e.target.value);
                                setRelativePhase(newPhase);
                            }}
                            min="0" 
                            max="6.28" 
                            step="0.1"
                            disabled={currentExperiment === 'spinning'}
                        />
                        <div className="value-display">
                            {getPhaseDisplay()}
                            {currentExperiment === 'spinning' && <span style={{color: '#4CAF50'}}> (auto)</span>}
                        </div>
                    </div>
                    
                    <label><strong>Amplitude Ratio:</strong></label>
                    <div className="slider-container">
                        <input 
                            type="range" 
                            value={amplitudeRatio}
                            onChange={(e) => {
                                const newRatio = parseFloat(e.target.value);
                                setAmplitudeRatio(newRatio);
                            }}
                            min="0" 
                            max="1" 
                            step="0.05"
                        />
                        <div className="value-display">{amplitudeRatio}</div>
                    </div>
                    
                    <label><strong>Animation Speed:</strong></label>
                    <div className="slider-container">
                        <input 
                            type="range" 
                            value={animationSpeed}
                            onChange={(e) => setAnimationSpeed(e.target.value)}
                            min="0.5" 
                            max="3" 
                            step="0.1"
                        />
                        <div className="value-display">{animationSpeed}x</div>
                    </div>
                </div>

                <div className="card control-group">
                    <h3>⚡ Quantum Experiments</h3>
                    
                    <button 
                        onClick={constructiveInterference}
                        className={currentExperiment === 'constructive' ? 'active' : ''}
                    >
                        🌊 Perfect Sync (0°)
                    </button>
                    
                    <button 
                        onClick={destructiveInterference}
                        className={currentExperiment === 'destructive' ? 'active' : ''}
                    >
                        🌊 Perfect Cancel (180°)
                    </button>
                    
                    <button 
                        onClick={mixedInterference}
                        className={currentExperiment === 'mixed' ? 'active' : ''}
                    >
                        🌊 Mixed Waves (90°)
                    </button>
                    
                    <button 
                        onClick={spinningState}
                        className={currentExperiment === 'spinning' ? 'active' : ''}
                    >
                        🔄 Spinning State
                    </button>
                    
                    <button 
                        onClick={equalSuperposition}
                        className={currentExperiment === 'equal' ? 'active' : ''}
                    >
                        ⚖️ Quantum Coin Flip
                    </button>
                </div>
            </div>

            <div className="visualization-container">
                <div className="card">
                    <h3>🎨 Interference Pattern</h3>
                    <div className="interference-pattern">
                        <div className="wave-canvas">
                            <canvas ref={canvasRef} width="600" height="200"></canvas>
                        </div>
                        
                        <div className="probability-display">
                            {probabilities.map((prob, index) => (
                                <div key={index} className="prob-item">
                                    <div>|{index.toString(2).padStart(numQubits, '0')}⟩</div>
                                    <div className="prob-bar" style={{height: `${prob * 100}px`}}></div>
                                    <div>{(prob * 100).toFixed(1)}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3>📊 Amplitude Analysis</h3>
                    <div className="probability-display">
                        {displayAmplitudes.map((amp, index) => {
                            if (Math.abs(amp.magnitude) <= 0.01) return null;
                            
                            return (
                                <div key={index} className="prob-item">
                                    <div>|{index.toString(2).padStart(numQubits, '0')}⟩</div>
                                    <div className="amplitude-circle">
                                        <div 
                                            className="phase-indicator" 
                                            style={{transform: `translate(-50%, -100%) rotate(${amp.phase}rad)`}}
                                        ></div>
                                    </div>
                                    <div className="complex-num">{formatComplex(amp)}</div>
                                    <div>|α|² = {(amp.magnitude * amp.magnitude).toFixed(3)}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="card">
                <h3>🧪 Current Experiment: {getExperimentTitle()}</h3>
                <div className="experiment-info">
                    <p>{getExperimentDescription()}</p>
                    
                    <div className="formula">
                        <strong>Wave Function:</strong><br/>
                        {getWaveFunction()}
                    </div>
                    
                    <div className="formula">
                        <strong>Interference Condition:</strong><br/>
                        {getInterferenceCondition()}
                    </div>
                </div>
            </div>
        </div>
    );
};
