// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../styles/interference.module.css';

// Client-side only quantum library import
let Q5M;
if (typeof window !== 'undefined') {
  // Dynamic import for browser-only
  import('../../../../../../dist/q5m.min.js').then((module) => {
    Q5M = window.Q5M; // Q5M attaches itself to window
  });
}

export default function InterferenceVisualization() {
  // State variables
  const [relativePhase, setRelativePhase] = useState(0);
  const [amplitudeRatio, setAmplitudeRatio] = useState(0.7);
  const [animationSpeed, setAnimationSpeed] = useState(1.5);
  const [currentExperiment, setCurrentExperiment] = useState('double-slit');
  const [numQubits, setNumQubits] = useState(1);
  const [quantumState, setQuantumState] = useState(null);
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  
  // Refs for canvas and animation
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);
  const timeRef = useRef(0);

  // Check if Q5M is available
  useEffect(() => {
    const checkLibrary = () => {
      if (typeof window !== 'undefined' && window.Q5M) {
        Q5M = window.Q5M;
        setIsLibraryLoaded(true);
      } else {
        setTimeout(checkLibrary, 100);
      }
    };
    checkLibrary();
  }, []);

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
      case 'double-slit': return 'Double-Slit Experiment';
      case 'mach-zehnder': return 'Mach-Zehnder Interferometer';
      case 'ramsey': return 'Ramsey Fringes';
      case 'custom': return 'Custom Superposition';
      default: return 'Quantum Interference';
    }
  };

  const getExperimentDescription = () => {
    switch (currentExperiment) {
      case 'double-slit':
        return 'Classic demonstration of wave-particle duality. A quantum particle can travel through both slits simultaneously, creating an interference pattern that depends on the relative phase between the two paths.';
      case 'mach-zehnder':
        return 'Quantum interferometer using beam splitters. Demonstrates how quantum amplitudes combine and interfere, with the final measurement probability depending on the relative phase accumulated along different optical paths.';
      case 'ramsey':
        return 'Time-domain interference experiment. Two separated oscillating fields create fringes in the final state population as a function of the phase difference between the fields, crucial for atomic clocks and precision measurements.';
      case 'custom':
        return 'Explore arbitrary quantum superpositions with adjustable amplitudes and phases. Observe how different combinations create constructive and destructive interference patterns in the measurement probabilities.';
      default:
        return '';
    }
  };

  const getWaveFunction = () => {
    const ratio = parseFloat(amplitudeRatio);
    const phase = getPhaseDisplay();
    
    switch (currentExperiment) {
      case 'double-slit':
        return `|ψ⟩ = ${ratio.toFixed(2)}|path1⟩ + ${(Math.sqrt(1-ratio*ratio)).toFixed(2)}e^(i${phase})|path2⟩`;
      case 'mach-zehnder':
        return `|ψ⟩ = (1/√2)(|0⟩ + e^(i${phase})|1⟩) after interferometer`;
      case 'ramsey':
        return `|ψ⟩ = cos(θ/2)|0⟩ + sin(θ/2)e^(i${phase})|1⟩`;
      case 'custom':
        return `|ψ⟩ = ${ratio.toFixed(2)}|0⟩ + ${(Math.sqrt(1-ratio*ratio)).toFixed(2)}e^(i${phase})|1⟩`;
      default:
        return '';
    }
  };

  const getInterferenceCondition = () => {
    switch (currentExperiment) {
      case 'double-slit':
        return 'Constructive: δ = 2nπ, Destructive: δ = (2n+1)π';
      case 'mach-zehnder':
        return 'Fringe visibility V = 2|α₁||α₂|/(|α₁|² + |α₂|²)';
      case 'ramsey':
        return 'Oscillation frequency ∝ detuning between field and transition';
      case 'custom':
        return 'P(|0⟩) = |α₀|², P(|1⟩) = |α₁|², with interference terms';
      default:
        return '';
    }
  };

  // Functions
  const createQuantumState = useCallback(() => {
    if (!isLibraryLoaded || !Q5M) return;
    
    const circuit = new Q5M.Circuit(1);
    const ratio = parseFloat(amplitudeRatio);
    const phase = parseFloat(relativePhase);
    
    // Create superposition state based on current experiment
    switch (currentExperiment) {
      case 'double-slit':
      case 'custom':
        // General superposition with adjustable amplitude and phase
        const theta = Math.acos(ratio);
        circuit.ry(0, 2 * theta);
        if (Math.abs(phase) > 0.01) {
          circuit.rz(0, phase);
        }
        break;
        
      case 'mach-zehnder':
        // Symmetric superposition with phase
        circuit.h(0);
        if (Math.abs(phase) > 0.01) {
          circuit.rz(0, phase);
        }
        break;
        
      case 'ramsey':
        // Ramsey sequence simulation
        circuit.ry(0, Math.PI/2);  // First π/2 pulse
        circuit.rz(0, phase);       // Free evolution phase
        circuit.ry(0, Math.PI/2 * ratio);  // Second pulse (variable)
        break;
    }
    
    const result = circuit.execute();
    setQuantumState(result.state);
  }, [currentExperiment, amplitudeRatio, relativePhase, isLibraryLoaded]);

  const drawWavePattern = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(15, 15, 35, 0.1)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw interference pattern
    const centerY = height / 2;
    const amplitude1 = parseFloat(amplitudeRatio) * 60;
    const amplitude2 = Math.sqrt(1 - amplitudeRatio * amplitudeRatio) * 60;
    const phase = parseFloat(relativePhase);
    const timeOffset = timeRef.current * parseFloat(animationSpeed);
    
    ctx.lineWidth = 2;
    
    // Draw wave 1 (Path A)
    ctx.strokeStyle = 'rgba(76, 175, 80, 0.8)';
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
      const y1 = centerY + amplitude1 * Math.sin(0.015 * x + timeOffset);
      if (x === 0) ctx.moveTo(x, y1);
      else ctx.lineTo(x, y1);
    }
    ctx.stroke();
    
    // Draw wave 2 (Path B)
    ctx.strokeStyle = 'rgba(156, 39, 176, 0.8)';
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
      const y2 = centerY + amplitude2 * Math.sin(0.015 * x + timeOffset + phase);
      if (x === 0) ctx.moveTo(x, y2);
      else ctx.lineTo(x, y2);
    }
    ctx.stroke();
    
    // Draw interference pattern (Sum of amplitudes)
    ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
      const y1 = amplitude1 * Math.sin(0.015 * x + timeOffset);
      const y2 = amplitude2 * Math.sin(0.015 * x + timeOffset + phase);
      const yTotal = centerY + y1 + y2;
      if (x === 0) ctx.moveTo(x, yTotal);
      else ctx.lineTo(x, yTotal);
    }
    ctx.stroke();
    
    // Draw enhancement/suppression regions
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 193, 7, 0.6)';
    for (let x = 0; x < width; x += 20) {
      const y1 = amplitude1 * Math.sin(0.015 * x + timeOffset);
      const y2 = amplitude2 * Math.sin(0.015 * x + timeOffset + phase);
      const totalAmplitude = Math.abs(y1 + y2);
      
      if (totalAmplitude > (amplitude1 + amplitude2) * 0.8) {
        // Constructive interference region
        ctx.fillStyle = 'rgba(76, 175, 80, 0.1)';
        ctx.fillRect(x, centerY - 80, 2, 160);
      } else if (totalAmplitude < (amplitude1 + amplitude2) * 0.3) {
        // Destructive interference region
        ctx.fillStyle = 'rgba(244, 67, 54, 0.1)';
        ctx.fillRect(x, centerY - 80, 2, 160);
      }
    }
    
    // Add labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillText('Wave A (Path 1)', 10, 25);
    ctx.fillText('Wave B (Path 2)', 10, 45);
    ctx.fillText('Interference Pattern', 10, 65);
    
    // Add phase information
    ctx.fillStyle = 'rgba(255, 193, 7, 0.9)';
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText(`δ = ${getPhaseDisplay()}`, width - 100, 25);
    
    // Draw amplitude indicators
    const rightX = width - 50;
    ctx.strokeStyle = 'rgba(76, 175, 80, 0.8)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(rightX, centerY - amplitude1);
    ctx.lineTo(rightX, centerY + amplitude1);
    ctx.stroke();
    
    ctx.strokeStyle = 'rgba(156, 39, 176, 0.8)';
    ctx.beginPath();
    ctx.moveTo(rightX + 10, centerY - amplitude2);
    ctx.lineTo(rightX + 10, centerY + amplitude2);
    ctx.stroke();
  }, [amplitudeRatio, relativePhase, animationSpeed]);

  const animate = useCallback(() => {
    if (isAnimating) {
      timeRef.current += 0.03;
      drawWavePattern();
    }
    animationIdRef.current = requestAnimationFrame(animate);
  }, [drawWavePattern, isAnimating]);

  const updateInterference = useCallback(() => {
    createQuantumState();
    if (canvasRef.current) {
      drawWavePattern();
    }
  }, [createQuantumState, drawWavePattern]);

  // Experiment functions
  const doubleSlitExperiment = () => {
    setCurrentExperiment('double-slit');
    setNumQubits(1);
    setAmplitudeRatio(0.7);
    setRelativePhase(Math.PI / 2);
  };

  const machZehnderInterferometer = () => {
    setCurrentExperiment('mach-zehnder');
    setNumQubits(1);
    setAmplitudeRatio(0.707); // 1/√2
    setRelativePhase(Math.PI);
  };

  const ramseyFringes = () => {
    setCurrentExperiment('ramsey');
    setNumQubits(1);
    setAmplitudeRatio(0.8);
    setRelativePhase(0);
  };

  const customSuperposition = () => {
    setCurrentExperiment('custom');
    setNumQubits(1);
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

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  // Effects
  useEffect(() => {
    if (isLibraryLoaded) {
      updateInterference();
    }
  }, [updateInterference, isLibraryLoaded]);

  useEffect(() => {
    if (canvasRef.current && isLibraryLoaded) {
      // Set canvas size for high DPI displays
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.getContext('2d').scale(dpr, dpr);
      
      animate();
    }
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [animate, isLibraryLoaded]);

  if (!isLibraryLoaded) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading Q5M quantum library...</p>
      </div>
    );
  }

  const probabilities = getProbabilities();
  const displayAmplitudes = getDisplayAmplitudes();

  return (
    <div className={styles.interferenceContainer}>
      <div className={styles.controlsSection}>
        <div className={styles.card}>
          <h3>🎛️ Wave Parameters</h3>
          <div className={styles.controlGrid}>
            <div className={styles.controlGroup}>
              <label><strong>Relative Phase (δ):</strong></label>
              <div className={styles.sliderContainer}>
                <input 
                  type="range" 
                  value={relativePhase}
                  onChange={(e) => setRelativePhase(e.target.value)}
                  min="0" 
                  max="6.28" 
                  step="0.1"
                />
                <div className={styles.valueDisplay}>{getPhaseDisplay()}</div>
              </div>
            </div>
            
            <div className={styles.controlGroup}>
              <label><strong>Amplitude Ratio:</strong></label>
              <div className={styles.sliderContainer}>
                <input 
                  type="range" 
                  value={amplitudeRatio}
                  onChange={(e) => setAmplitudeRatio(e.target.value)}
                  min="0" 
                  max="1" 
                  step="0.05"
                />
                <div className={styles.valueDisplay}>{amplitudeRatio}</div>
              </div>
            </div>
            
            <div className={styles.controlGroup}>
              <label><strong>Animation Speed:</strong></label>
              <div className={styles.sliderContainer}>
                <input 
                  type="range" 
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(e.target.value)}
                  min="0.5" 
                  max="3" 
                  step="0.1"
                />
                <div className={styles.valueDisplay}>{animationSpeed}x</div>
              </div>
            </div>
          </div>
          
          <div className={styles.animationControls}>
            <button 
              onClick={toggleAnimation}
              className={`${styles.controlButton} ${isAnimating ? styles.active : ''}`}
            >
              {isAnimating ? '⏸️ Pause' : '▶️ Play'}
            </button>
          </div>
        </div>

        <div className={styles.card}>
          <h3>⚡ Quantum Experiments</h3>
          <div className={styles.experimentButtons}>
            <button 
              onClick={doubleSlitExperiment}
              className={`${styles.experimentButton} ${currentExperiment === 'double-slit' ? styles.active : ''}`}
            >
              Double-Slit Experiment
            </button>
            
            <button 
              onClick={machZehnderInterferometer}
              className={`${styles.experimentButton} ${currentExperiment === 'mach-zehnder' ? styles.active : ''}`}
            >
              Mach-Zehnder Interferometer
            </button>
            
            <button 
              onClick={ramseyFringes}
              className={`${styles.experimentButton} ${currentExperiment === 'ramsey' ? styles.active : ''}`}
            >
              Ramsey Fringes
            </button>
            
            <button 
              onClick={customSuperposition}
              className={`${styles.experimentButton} ${currentExperiment === 'custom' ? styles.active : ''}`}
            >
              Custom Superposition
            </button>
          </div>
        </div>
      </div>

      <div className={styles.visualizationSection}>
        <div className={styles.card}>
          <h3>🎨 Interference Pattern</h3>
          <div className={styles.canvasContainer}>
            <canvas 
              ref={canvasRef} 
              className={styles.waveCanvas}
              style={{width: '100%', height: '250px'}}
            ></canvas>
          </div>
          
          <div className={styles.probabilitySection}>
            <h4>Measurement Probabilities</h4>
            <div className={styles.probabilityDisplay}>
              {probabilities.map((prob, index) => (
                <div key={index} className={styles.probItem}>
                  <div className={styles.stateLabel}>|{index.toString(2).padStart(numQubits, '0')}⟩</div>
                  <div className={styles.probBar} style={{height: `${prob * 120}px`}}></div>
                  <div className={styles.probValue}>{(prob * 100).toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h3>📊 Amplitude Analysis</h3>
          <div className={styles.amplitudeSection}>
            <div className={styles.amplitudeDisplay}>
              {displayAmplitudes.map((amp, index) => {
                if (Math.abs(amp.magnitude) <= 0.01) return null;
                
                return (
                  <div key={index} className={styles.amplitudeItem}>
                    <div className={styles.stateLabel}>|{index.toString(2).padStart(numQubits, '0')}⟩</div>
                    <div className={styles.amplitudeCircle}>
                      <div 
                        className={styles.phaseIndicator} 
                        style={{
                          transform: `rotate(${amp.phase}rad)`,
                          height: `${amp.magnitude * 40}px`
                        }}
                      ></div>
                    </div>
                    <div className={styles.complexNum}>{formatComplex(amp)}</div>
                    <div className={styles.magnitude}>|α|² = {(amp.magnitude * amp.magnitude).toFixed(3)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h3>🧪 Current Experiment: {getExperimentTitle()}</h3>
        <div className={styles.experimentInfo}>
          <p className={styles.description}>{getExperimentDescription()}</p>
          
          <div className={styles.formulaSection}>
            <div className={styles.formula}>
              <strong>Wave Function:</strong><br/>
              <code>{getWaveFunction()}</code>
            </div>
            
            <div className={styles.formula}>
              <strong>Interference Condition:</strong><br/>
              <code>{getInterferenceCondition()}</code>
            </div>
          </div>
          
          <div className={styles.physicsInfo}>
            <div className={styles.infoGrid}>
              <div>
                <strong>Constructive Interference:</strong><br/>
                Occurs when wave peaks align (δ = 2nπ)
              </div>
              <div>
                <strong>Destructive Interference:</strong><br/>
                Occurs when peaks align with troughs (δ = (2n+1)π)
              </div>
              <div>
                <strong>Visibility:</strong><br/>
                V = (I_max - I_min)/(I_max + I_min)
              </div>
              <div>
                <strong>Coherence:</strong><br/>
                Determines interference pattern clarity
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
