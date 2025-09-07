// SPDX-License-Identifier: MIT
// Copyright (c) 2024 OpenQL Project
// React component for quantum entanglement demonstration
// This file shows the JSX component structure for use in React projects

import React, { useState, useEffect, useCallback } from 'react';

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

const EntanglementDemo = () => {
    const [circuit, setCircuit] = useState(null);
    const [quantumState, setQuantumState] = useState(null);
    const [currentState, setCurrentState] = useState('reset');
    const [numQubits, setNumQubits] = useState(3);
    
    const executeCircuit = useCallback(() => {
        if (!circuit) return;
        try {
            const result = circuit.execute();
            setQuantumState(result.state);
        } catch (error) {
            console.error('Circuit execution error:', error);
        }
    }, [circuit]);

    const probabilities = quantumState ? quantumState.probabilities() : [];
    const amplitudes = quantumState ? quantumState.amplitudes() : [];

    const getStateDescription = () => {
        switch (currentState) {
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
    };

    const getEntanglementInfo = () => {
        switch (currentState) {
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
    };

    const getSchmidtRank = () => {
        switch (currentState) {
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
    };

    const createBellState = () => {
        const newCircuit = new Q5M.Circuit(2);
        setNumQubits(2);
        
        // Create Bell state: H(0) CNOT(0,1)
        newCircuit.h(0).cnot(0, 1);
        
        setCircuit(newCircuit);
        setCurrentState('bell');
    };

    const createBellStateMinus = () => {
        const newCircuit = new Q5M.Circuit(2);
        setNumQubits(2);
        
        // Create Bell state with phase: X(0) H(0) CNOT(0,1)
        newCircuit.x(0).h(0).cnot(0, 1);
        
        setCircuit(newCircuit);
        setCurrentState('bell-');
    };

    const createGHZState = () => {
        const newCircuit = new Q5M.Circuit(3);
        setNumQubits(3);
        
        // Create GHZ state: H(0) CNOT(0,1) CNOT(0,2)
        newCircuit.h(0).cnot(0, 1).cnot(0, 2);
        
        setCircuit(newCircuit);
        setCurrentState('ghz');
    };

    const createWState = () => {
        const newCircuit = new Q5M.Circuit(3);
        setNumQubits(3);
        
        // Create W state using rotation gates
        newCircuit
            .ry(0, Math.acos(Math.sqrt(2/3)))
            .cnot(0, 1)
            .x(0)
            .cry(1, 2, Math.acos(Math.sqrt(1/2)))
            .cnot(0, 1);
        
        setCircuit(newCircuit);
        setCurrentState('w');
    };

    const resetState = () => {
        const newCircuit = new Q5M.Circuit(3);
        setNumQubits(3);
        
        setCircuit(newCircuit);
        setCurrentState('reset');
    };

    useEffect(() => {
        executeCircuit();
    }, [executeCircuit]);

    useEffect(() => {
        // Initialize with reset state
        resetState();
    }, []);

    return (
        <div className="entanglement-container">
            <div className="header">
                <h1>🔗 Quantum Entanglement with React</h1>
                <p>Explore Bell states and GHZ states using Q5M.js</p>
            </div>

            <div className="card">
                <h3>🎯 Create Entangled States</h3>
                <div className="controls">
                    <button 
                        className={`state-button ${currentState === 'bell' ? 'active' : ''}`}
                        onClick={createBellState}
                    >
                        Bell State |Φ⁺⟩
                    </button>
                    <button 
                        className={`state-button ${currentState === 'bell-' ? 'active' : ''}`}
                        onClick={createBellStateMinus}
                    >
                        Bell State |Φ⁻⟩
                    </button>
                    <button 
                        className={`state-button ${currentState === 'ghz' ? 'active' : ''}`}
                        onClick={createGHZState}
                    >
                        GHZ State (3 qubits)
                    </button>
                    <button 
                        className={`state-button ${currentState === 'w' ? 'active' : ''}`}
                        onClick={createWState}
                    >
                        W State (3 qubits)
                    </button>
                    <button 
                        className={`state-button ${currentState === 'reset' ? 'active' : ''}`}
                        onClick={resetState}
                    >
                        Reset |000⟩
                    </button>
                </div>
            </div>

            <div className="state-display">
                <div className="card">
                    <h3>📊 Measurement Probabilities</h3>
                    <div className="probabilities">
                        {probabilities.map((prob, index) => (
                            <div key={index} className="probability-bar">
                                <div 
                                    className="bar" 
                                    style={{height: `${prob * 200}px`}}
                                ></div>
                                <div>|{index.toString(2).padStart(numQubits, '0')}⟩</div>
                                <div>{(prob * 100).toFixed(1)}%</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3>🌊 Quantum Amplitudes</h3>
                    <div className="amplitude-display">
                        {amplitudes.map((amp, index) => {
                            if (!amp || (Math.abs(amp.re) <= 0.01 && Math.abs(amp.im) <= 0.01)) return null;
                            
                            return (
                                <div key={index} className="amplitude">
                                    <div>|{index.toString(2).padStart(numQubits, '0')}⟩</div>
                                    <div className="complex-num">
                                        {formatComplex(amp)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="card">
                <h3>ℹ️ State Information</h3>
                <div className="state-info">
                    <div><strong>Current State:</strong> {getStateDescription()}</div>
                    <div><strong>Number of Qubits:</strong> {numQubits}</div>
                    <div><strong>Entanglement:</strong> {getEntanglementInfo()}</div>
                    <div><strong>Schmidt Rank:</strong> {getSchmidtRank()}</div>
                </div>
            </div>
        </div>
    );
};

export default EntanglementDemo;
