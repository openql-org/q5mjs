// SPDX-License-Identifier: MIT
// Copyright (c) 2024 OpenQL Project
// React component for Hadamard Test demonstration
// This file shows the JSX component structure for use in React projects

const { useState, useEffect, useCallback } = React;

const HadamardTest = () => {
    // State variables
    const [phase, setPhase] = useState(1.57); // π/2 by default
    const [gateType, setGateType] = useState('phase');
    const [prob0, setProb0] = useState(0.5);
    const [prob1, setProb1] = useState(0.5);
    const [isRunning, setIsRunning] = useState(false);

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

    // Main Hadamard test function
    const runHadamardTest = useCallback(() => {
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
                    // Controlled-S gate using controlled phase with π/2
                    circuit.cp(0, 1, Math.PI / 2);
                    break;
                case 't':
                    // Controlled-T gate using controlled phase with π/4
                    circuit.cp(0, 1, Math.PI / 4);
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
    }, [gateType, phase]);

    const runMultipleMeasurements = async () => {
        setIsRunning(true);
        
        let totalZeros = 0;
        const numMeasurements = 1000;
        
        for (let i = 0; i < numMeasurements; i++) {
            // Simulate individual measurements
            const circuit = new Q5M.Circuit(2);
            
            // Prepare target in |1⟩
            circuit.x(1);
            
            // Hadamard test protocol
            circuit.h(0);
            
            switch (gateType) {
                case 'z': 
                    circuit.cz(0, 1); 
                    break;
                case 's': 
                    // Controlled-S gate using controlled phase with π/2
                    circuit.cp(0, 1, Math.PI / 2); 
                    break;
                case 't': 
                    // Controlled-T gate using controlled phase with π/4
                    circuit.cp(0, 1, Math.PI / 4); 
                    break;
                case 'phase': 
                    circuit.cp(0, 1, parseFloat(phase)); 
                    break;
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
                setProb0(totalZeros / (i + 1));
                setProb1(1 - totalZeros / (i + 1));
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        
        // Final update
        setProb0(totalZeros / numMeasurements);
        setProb1(1 - totalZeros / numMeasurements);
        
        setIsRunning(false);
    };

    // Initialize
    useEffect(() => {
        runHadamardTest();
    }, [runHadamardTest]);

    return (
        <div>
            <div className="header">
                <h1>🧪 Hadamard Test with React</h1>
                <p>Explore phase estimation and phase kickback phenomena</p>
            </div>

            <div className="card">
                <h3>⚙️ Test Parameters</h3>
                <div className="controls">
                    <div className="control-group">
                        <label><strong>Phase (φ):</strong></label>
                        <div className="slider-container">
                            <input 
                                type="range" 
                                value={phase}
                                onChange={(e) => setPhase(e.target.value)}
                                min="0" 
                                max="6.28318" 
                                step="0.1"
                            />
                            <div className="phase-display">{getPhaseDisplay()}</div>
                        </div>
                    </div>
                    
                    <div className="control-group">
                        <label><strong>Gate Type:</strong></label>
                        <select value={gateType} onChange={(e) => setGateType(e.target.value)}>
                            <option value="z">Z Gate (Phase flip)</option>
                            <option value="s">S Gate (π/2 phase)</option>
                            <option value="t">T Gate (π/4 phase)</option>
                            <option value="phase">Phase Gate (custom φ)</option>
                        </select>
                    </div>
                    
                    <div className="control-group">
                        <label><strong>Measurements:</strong></label>
                        <button onClick={runMultipleMeasurements} disabled={isRunning}>
                            {isRunning ? 'Running...' : 'Run 1000 Tests'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="results-grid">
                <div className="card">
                    <h3>📊 Measurement Results</h3>
                    <div className="measurement-results">
                        <div><strong>Ancilla Qubit (Control) Measurements:</strong></div>
                        <div className="result-bar">
                            <span style={{width: '60px'}}>|0⟩:</span>
                            <div className="bar" style={{width: `${prob0 * 300}px`}}>
                                {(prob0 * 100).toFixed(1)}%
                            </div>
                        </div>
                        <div className="result-bar">
                            <span style={{width: '60px'}}>|1⟩:</span>
                            <div className="bar" style={{width: `${prob1 * 300}px`}}>
                                {(prob1 * 100).toFixed(1)}%
                            </div>
                        </div>
                        
                        <div style={{marginTop: '20px'}}>
                            <strong>Estimated Phase:</strong> {getEstimatedPhase()}
                            <br/>
                            <strong>Actual Phase:</strong> {getActualPhase()}
                            <br/>
                            <strong>Error:</strong> {getPhaseError()}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3>🔄 Circuit Diagram</h3>
                    <div className="circuit-display">
                        <div className="qubit-line">
                            <span style={{width: '80px'}}>Ancilla |+⟩:</span>
                            <div className="gate">H</div>
                            <div className="gate controlled-gate">●</div>
                            <div className="gate">H</div>
                            <div className="gate" style={{background: '#F39C12'}}>M</div>
                        </div>
                        <div className="qubit-line">
                            <span style={{width: '80px'}}>Target |ψ⟩:</span>
                            <div style={{width: '40px'}}></div>
                            <div className="gate">{getGateSymbol()}</div>
                            <div style={{width: '40px'}}></div>
                            <div style={{width: '40px'}}></div>
                        </div>
                    </div>
                    
                    <div className="phase-info">
                        <div className="info-item">
                            <div>Expected P(|0⟩)</div>
                            <div className="eigenvalue">{getExpectedProb0()}</div>
                        </div>
                        <div className="info-item">
                            <div>Eigenvalue</div>
                            <div className="eigenvalue">e^(iφ)</div>
                        </div>
                        <div className="info-item">
                            <div>Phase Kickback</div>
                            <div className="eigenvalue">{getPhaseKickback()}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3>📚 Algorithm Explanation</h3>
                <div className="measurement-results">
                    <p><strong>Hadamard Test:</strong> A quantum algorithm to estimate the real part of ⟨ψ|U|ψ⟩ where U is a unitary operator.</p>
                    
                    <p><strong>Steps:</strong></p>
                    <ol>
                        <li>Prepare ancilla qubit in |+⟩ = (|0⟩ + |1⟩)/√2 using Hadamard gate</li>
                        <li>Apply controlled-U operation with ancilla as control</li>
                        <li>Apply Hadamard to ancilla again</li>
                        <li>Measure ancilla: P(|0⟩) = (1 + Re(⟨ψ|U|ψ⟩))/2</li>
                    </ol>
                    
                    <p><strong>Phase Kickback:</strong> When the controlled gate acts on an eigenstate, the phase is "kicked back" to the control qubit, enabling phase estimation.</p>
                </div>
            </div>
        </div>
    );
};
