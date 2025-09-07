// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { useState, useEffect, useCallback } from 'react';
import styles from '../styles/hadamard.module.css';

// Client-side only quantum library import
let Q5M;
if (typeof window !== 'undefined') {
  // Dynamic import for browser-only
  import('../../../../../../dist/q5m.min.js').then((module) => {
    Q5M = window.Q5M; // Q5M attaches itself to window
  });
}

export default function HadamardTest() {
  // State variables
  const [phase, setPhase] = useState(1.57); // π/2 by default
  const [gateType, setGateType] = useState('phase');
  const [prob0, setProb0] = useState(0.5);
  const [prob1, setProb1] = useState(0.5);
  const [isRunning, setIsRunning] = useState(false);
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
  const [measurementHistory, setMeasurementHistory] = useState([]);

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
    const phaseValue = parseFloat(phase);
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
  };

  const getGateSymbol = () => {
    switch (gateType) {
      case 'z': return 'Z';
      case 's': return 'S';
      case 't': return 'T';
      case 'phase': return 'φ';
      default: return 'U';
    }
  };

  const getActualPhase = () => {
    switch (gateType) {
      case 'z': return 'π';
      case 's': return 'π/2';
      case 't': return 'π/4';
      case 'phase': return getPhaseDisplay();
      default: return '0';
    }
  };

  const getExpectedProb0 = () => {
    let phaseValue;
    switch (gateType) {
      case 'z': phaseValue = Math.PI; break;
      case 's': phaseValue = Math.PI / 2; break;
      case 't': phaseValue = Math.PI / 4; break;
      case 'phase': phaseValue = parseFloat(phase); break;
      default: phaseValue = 0;
    }
    
    // For eigenstate |1⟩, the probability is (1 + cos(φ))/2
    const expected = (1 + Math.cos(phaseValue)) / 2;
    return expected.toFixed(3);
  };

  const getEstimatedPhase = () => {
    // Estimate phase from measurement probability
    // P(|0⟩) = (1 + cos(φ))/2, so φ = arccos(2*P(|0⟩) - 1)
    const phaseEst = Math.acos(2 * prob0 - 1);
    const piRatio = phaseEst / Math.PI;
    
    if (Math.abs(piRatio - 0.5) < 0.05) return 'π/2';
    if (Math.abs(piRatio - 0.25) < 0.05) return 'π/4';
    if (Math.abs(piRatio - 0.75) < 0.05) return '3π/4';
    if (Math.abs(piRatio - 1) < 0.05) return 'π';
    
    return `${phaseEst.toFixed(2)}`;
  };

  const getPhaseError = () => {
    let truePhase;
    switch (gateType) {
      case 'z': truePhase = Math.PI; break;
      case 's': truePhase = Math.PI / 2; break;
      case 't': truePhase = Math.PI / 4; break;
      case 'phase': truePhase = parseFloat(phase); break;
      default: truePhase = 0;
    }
    
    const estimatedPhaseValue = Math.acos(2 * prob0 - 1);
    const error = Math.abs(truePhase - estimatedPhaseValue);
    return `${error.toFixed(3)}`;
  };

  const getPhaseKickback = () => {
    const phaseVal = parseFloat(phase);
    if (Math.abs(phaseVal) < 0.01) return 'None';
    return `Phase e^(i${getPhaseDisplay()}) → Control`;
  };

  const getCircuitDescription = () => {
    switch (gateType) {
      case 'z':
        return 'Z-gate flips the phase of |1⟩ state by π, demonstrating maximum phase kickback.';
      case 's':
        return 'S-gate applies π/2 phase rotation, commonly used in quantum algorithms.';
      case 't':
        return 'T-gate applies π/4 phase rotation, fundamental building block for universal quantum computing.';
      case 'phase':
        return `Custom phase gate applies e^(iφ) rotation with φ = ${getPhaseDisplay()}.`;
      default:
        return 'Identity operation with no phase effect.';
    }
  };

  // Main Hadamard test function
  const runHadamardTest = useCallback(() => {
    if (!isLibraryLoaded || !Q5M) return;
    
    try {
      // Create 2-qubit circuit: ancilla + target
      const circuit = new Q5M.Circuit(2);
      
      // Prepare target qubit in eigenstate |1⟩
      circuit.x(1);
      
      // Hadamard on ancilla (qubit 0) 
      circuit.h(0);
      
      // Apply controlled gate based on selection
      switch (gateType) {
        case 'z':
          circuit.cz(0, 1);
          break;
        case 's':
          circuit.cs(0, 1);
          break;
        case 't':
          circuit.ct(0, 1);
          break;
        case 'phase':
          circuit.cp(0, 1, parseFloat(phase));
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
      
      setProb0(p0);
      setProb1(p1);
      
    } catch (error) {
      console.error('Hadamard test error:', error);
    }
  }, [gateType, phase, isLibraryLoaded]);

  const runMultipleMeasurements = async () => {
    if (!isLibraryLoaded || !Q5M) return;
    
    setIsRunning(true);
    setMeasurementHistory([]);
    
    let totalZeros = 0;
    const numMeasurements = 1000;
    const history = [];
    
    for (let i = 0; i < numMeasurements; i++) {
      // Simulate individual measurements
      const circuit = new Q5M.Circuit(2);
      
      // Prepare target in |1⟩
      circuit.x(1);
      
      // Hadamard test protocol
      circuit.h(0);
      
      switch (gateType) {
        case 'z': circuit.cz(0, 1); break;
        case 's': circuit.cs(0, 1); break;
        case 't': circuit.ct(0, 1); break;
        case 'phase': circuit.cp(0, 1, parseFloat(phase)); break;
      }
      
      circuit.h(0);
      
      // Measure ancilla qubit
      const result = circuit.execute();
      const measurement = result.state.measure([0]);
      
      if (measurement[0] === 0) totalZeros++;
      
      // Update display periodically
      if (i % 50 === 0) {
        const currentProb0 = totalZeros / (i + 1);
        const currentProb1 = 1 - currentProb0;
        setProb0(currentProb0);
        setProb1(currentProb1);
        
        history.push({
          measurement: i + 1,
          prob0: currentProb0,
          estimatedPhase: Math.acos(2 * currentProb0 - 1)
        });
        
        await new Promise(resolve => setTimeout(resolve, 5));
      }
    }
    
    // Final update
    const finalProb0 = totalZeros / numMeasurements;
    setProb0(finalProb0);
    setProb1(1 - finalProb0);
    setMeasurementHistory(history);
    
    setIsRunning(false);
  };

  // Initialize
  useEffect(() => {
    if (isLibraryLoaded) {
      runHadamardTest();
    }
  }, [runHadamardTest]);

  if (!isLibraryLoaded) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading Q5M quantum library...</p>
      </div>
    );
  }

  return (
    <div className={styles.hadamardContainer}>
      <div className={styles.card}>
        <h3>⚙️ Test Parameters</h3>
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label><strong>Phase (φ):</strong></label>
            <div className={styles.sliderContainer}>
              <input 
                type="range" 
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                min="0" 
                max="6.28318" 
                step="0.1"
                disabled={gateType !== 'phase'}
              />
              <div className={styles.phaseDisplay}>{getPhaseDisplay()}</div>
            </div>
          </div>
          
          <div className={styles.controlGroup}>
            <label><strong>Gate Type:</strong></label>
            <select value={gateType} onChange={(e) => setGateType(e.target.value)}>
              <option value="z">Z Gate (Phase flip)</option>
              <option value="s">S Gate (π/2 phase)</option>
              <option value="t">T Gate (π/4 phase)</option>
              <option value="phase">Phase Gate (custom φ)</option>
            </select>
          </div>
          
          <div className={styles.controlGroup}>
            <label><strong>Measurements:</strong></label>
            <button 
              onClick={runMultipleMeasurements} 
              disabled={isRunning}
              className={styles.measureButton}
            >
              {isRunning ? 'Running 1000 Tests...' : 'Run 1000 Tests'}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.resultsGrid}>
        <div className={styles.card}>
          <h3>📊 Measurement Results</h3>
          <div className={styles.measurementResults}>
            <div><strong>Ancilla Qubit (Control) Measurements:</strong></div>
            <div className={styles.resultBar}>
              <span style={{width: '60px'}}>|0⟩:</span>
              <div className={styles.bar} style={{width: `${prob0 * 300}px`}}>
                {(prob0 * 100).toFixed(1)}%
              </div>
            </div>
            <div className={styles.resultBar}>
              <span style={{width: '60px'}}>|1⟩:</span>
              <div className={styles.bar} style={{width: `${prob1 * 300}px`}}>
                {(prob1 * 100).toFixed(1)}%
              </div>
            </div>
            
            <div className={styles.phaseResults}>
              <div><strong>Estimated Phase:</strong> {getEstimatedPhase()}</div>
              <div><strong>Actual Phase:</strong> {getActualPhase()}</div>
              <div><strong>Error:</strong> {getPhaseError()}</div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h3>🔄 Circuit Diagram</h3>
          <div className={styles.circuitDisplay}>
            <div className={styles.qubitLine}>
              <span style={{width: '80px'}}>Ancilla |+⟩:</span>
              <div className={styles.gate}>H</div>
              <div className={styles.gate + ' ' + styles.controlledGate}>●</div>
              <div className={styles.gate}>H</div>
              <div className={`${styles.gate} ${styles.measurement}`}>M</div>
            </div>
            <div className={styles.qubitLine}>
              <span style={{width: '80px'}}>Target |ψ⟩:</span>
              <div style={{width: '40px'}}></div>
              <div className={styles.gate}>{getGateSymbol()}</div>
              <div style={{width: '40px'}}></div>
              <div style={{width: '40px'}}></div>
            </div>
            <div className={styles.connectionLine}></div>
          </div>
          
          <div className={styles.phaseInfo}>
            <div className={styles.infoItem}>
              <div>Expected P(|0⟩)</div>
              <div className={styles.eigenvalue}>{getExpectedProb0()}</div>
            </div>
            <div className={styles.infoItem}>
              <div>Eigenvalue</div>
              <div className={styles.eigenvalue}>e^(iφ)</div>
            </div>
            <div className={styles.infoItem}>
              <div>Phase Kickback</div>
              <div className={styles.eigenvalue}>{getPhaseKickback()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h3>📚 Algorithm Explanation</h3>
        <div className={styles.algorithmInfo}>
          <p><strong>Hadamard Test:</strong> A quantum algorithm to estimate the real part of ⟨ψ|U|ψ⟩ where U is a unitary operator.</p>
          
          <div className={styles.steps}>
            <h4>Protocol Steps:</h4>
            <ol>
              <li>Prepare ancilla qubit in |+⟩ = (|0⟩ + |1⟩)/√2 using Hadamard gate</li>
              <li>Apply controlled-U operation with ancilla as control</li>
              <li>Apply Hadamard to ancilla again</li>
              <li>Measure ancilla: P(|0⟩) = (1 + Re(⟨ψ|U|ψ⟩))/2</li>
            </ol>
          </div>
          
          <div className={styles.currentGate}>
            <h4>Current Gate: {getGateSymbol()} Gate</h4>
            <p>{getCircuitDescription()}</p>
          </div>
          
          <div className={styles.theory}>
            <p><strong>Phase Kickback:</strong> When the controlled gate acts on an eigenstate, 
            the phase is "kicked back" to the control qubit, enabling phase estimation through 
            measurement of the control qubit's final state.</p>
          </div>
        </div>
      </div>

      {measurementHistory.length > 0 && (
        <div className={styles.card}>
          <h3>📈 Measurement Convergence</h3>
          <div className={styles.convergenceDisplay}>
            <p>Showing convergence of probability estimates over {measurementHistory.length * 50} measurements</p>
            <div className={styles.historyGrid}>
              {measurementHistory.slice(-10).map((point, index) => (
                <div key={index} className={styles.historyPoint}>
                  <div>After {point.measurement} measurements</div>
                  <div>P(|0⟩) = {(point.prob0 * 100).toFixed(1)}%</div>
                  <div>Est. φ = {(point.estimatedPhase / Math.PI).toFixed(2)}π</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
