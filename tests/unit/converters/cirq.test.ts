// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { Circuit } from '@/core/Circuit';
import {
  exportToCirq,
  exportToCirqJSON,
  type CirqExportOptions,
} from '@/converters/cirq';

describe('Cirq Converter', () => {
  describe('Basic Circuit Export', () => {
    it('should export a simple circuit with default options', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);

      const cirqCode = exportToCirq(circuit);

      expect(cirqCode).toContain('import cirq');
      expect(cirqCode).toContain('qubits = cirq.LineQubit.range(2)');
      expect(cirqCode).toContain('circuit = cirq.Circuit()');
      expect(cirqCode).toContain('circuit.append(cirq.H(qubits[0]))');
      expect(cirqCode).toContain('circuit.append(cirq.CNOT(qubits[0], qubits[1]))');
    });

    it('should export a single qubit circuit', () => {
      const circuit = new Circuit(1);
      circuit.h(0);

      const cirqCode = exportToCirq(circuit);

      expect(cirqCode).toContain('qubits = cirq.LineQubit.range(1)');
      expect(cirqCode).toContain('circuit.append(cirq.H(qubits[0]))');
    });

    it('should handle empty circuit', () => {
      const circuit = new Circuit(2);

      const cirqCode = exportToCirq(circuit);

      expect(cirqCode).toContain('import cirq');
      expect(cirqCode).toContain('qubits = cirq.LineQubit.range(2)');
      expect(cirqCode).toContain('circuit = cirq.Circuit()');
      // Should not contain any gate operations
      expect(cirqCode).not.toMatch(/circuit\.append\(cirq\.[HXYZ]/);
    });
  });

  describe('Export Options', () => {
    it('should respect includeImports option', () => {
      const circuit = new Circuit(1);
      circuit.h(0);

      const withImports = exportToCirq(circuit, { includeImports: true });
      const withoutImports = exportToCirq(circuit, { includeImports: false });

      expect(withImports).toContain('import cirq');
      expect(withoutImports).not.toContain('import cirq');
      expect(withoutImports).toContain('circuit.append(cirq.H(qubits[0]))');
    });

    it('should respect includeComments option', () => {
      const circuit = new Circuit(1);
      circuit.h(0);

      const withComments = exportToCirq(circuit, { includeComments: true });
      const withoutComments = exportToCirq(circuit, { includeComments: false });

      expect(withComments).toContain('# Q5M.js exported circuit');
      expect(withComments).toContain('# Generated at:');
      expect(withComments).toContain('# Create qubits');
      expect(withComments).toContain('# Add gates');

      expect(withoutComments).not.toContain('# Q5M.js exported circuit');
      expect(withoutComments).not.toContain('# Generated at:');
      expect(withoutComments).not.toContain('# Create qubits');
      expect(withoutComments).not.toContain('# Add gates');
    });

    it('should respect circuitVariableName option', () => {
      const circuit = new Circuit(1);
      circuit.h(0);

      const cirqCode = exportToCirq(circuit, { circuitVariableName: 'my_circuit' });

      expect(cirqCode).toContain('my_circuit = cirq.Circuit()');
      expect(cirqCode).toContain('my_circuit.append(cirq.H(qubits[0]))');
    });

    it('should handle LineQubit vs GridQubit options', () => {
      const circuit = new Circuit(4);

      const lineQubitCode = exportToCirq(circuit, { qubitType: 'LineQubit' });
      const gridQubitCode = exportToCirq(circuit, { qubitType: 'GridQubit' });

      expect(lineQubitCode).toContain('qubits = cirq.LineQubit.range(4)');

      expect(gridQubitCode).toContain('qubits = []');
      expect(gridQubitCode).toContain('qubits.append(cirq.GridQubit(0, 0))');
      expect(gridQubitCode).toContain('qubits.append(cirq.GridQubit(0, 1))');
      expect(gridQubitCode).toContain('qubits.append(cirq.GridQubit(1, 0))');
      expect(gridQubitCode).toContain('qubits.append(cirq.GridQubit(1, 1))');
    });

    it('should handle includeMeasurements option', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);

      const cirqCode = exportToCirq(circuit, { includeMeasurements: true });

      expect(cirqCode).toContain('# Add measurements');
      expect(cirqCode).toContain('circuit.append([cirq.measure(qubits[0], key=\'q0\'), cirq.measure(qubits[1], key=\'q1\')])');
    });

    it('should handle includeSimulator option', () => {
      const circuit = new Circuit(1);
      circuit.h(0);

      const cirqCode = exportToCirq(circuit, { 
        includeSimulator: true,
        includeMeasurements: false 
      });

      expect(cirqCode).toContain('import numpy as np');
      expect(cirqCode).toContain('# Run simulation');
      expect(cirqCode).toContain('simulator = cirq.Simulator()');
      expect(cirqCode).toContain('result = simulator.simulate(circuit)');
      expect(cirqCode).toContain('print("Final state vector:")');
      expect(cirqCode).toContain('print(result.final_state_vector)');
    });

    it('should handle simulator with measurements', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);

      const cirqCode = exportToCirq(circuit, { 
        includeSimulator: true,
        includeMeasurements: true 
      });

      expect(cirqCode).toContain('result = simulator.run(circuit, repetitions=1000)');
      expect(cirqCode).toContain('print(result)');
    });
  });

  describe('Gate Conversion', () => {
    it('should convert single-qubit gates', () => {
      const circuit = new Circuit(1);
      circuit.h(0).x(0).y(0).z(0).s(0).t(0);

      const cirqCode = exportToCirq(circuit);

      expect(cirqCode).toContain('circuit.append(cirq.H(qubits[0]))');
      expect(cirqCode).toContain('circuit.append(cirq.X(qubits[0]))');
      expect(cirqCode).toContain('circuit.append(cirq.Y(qubits[0]))');
      expect(cirqCode).toContain('circuit.append(cirq.Z(qubits[0]))');
      expect(cirqCode).toContain('circuit.append(cirq.S(qubits[0]))');
      expect(cirqCode).toContain('circuit.append(cirq.T(qubits[0]))');
    });

    it('should convert two-qubit gates', () => {
      const circuit = new Circuit(2);
      circuit.cnot(0, 1).cz(0, 1).cy(0, 1).swap(0, 1);

      const cirqCode = exportToCirq(circuit);

      expect(cirqCode).toContain('circuit.append(cirq.CNOT(qubits[0], qubits[1]))');
      expect(cirqCode).toContain('circuit.append(cirq.CZ(qubits[0], qubits[1]))');
      expect(cirqCode).toContain('circuit.append(cirq.CY(qubits[0], qubits[1]))');
      expect(cirqCode).toContain('circuit.append(cirq.SWAP(qubits[0], qubits[1]))');
    });

    it('should convert parameterized rotation gates with parameters', () => {
      const circuit = new Circuit(3);
      circuit.rx(0, Math.PI/2).ry(1, Math.PI/4).rz(2, Math.PI/6);

      const cirqCode = exportToCirq(circuit);

      // Use regex to match approximate values due to precision differences
      expect(cirqCode).toMatch(/circuit\.append\(cirq\.rx\(1\.571?\d*\)\(qubits\[0\]\)\)/);
      expect(cirqCode).toMatch(/circuit\.append\(cirq\.ry\(0\.785?\d*\)\(qubits\[1\]\)\)/);
      expect(cirqCode).toMatch(/circuit\.append\(cirq\.rz\(0\.524?\d*\)\(qubits\[2\]\)\)/);
    });

    it('should convert phase gates with parameters', () => {
      const circuit = new Circuit(2);
      circuit.phase(0, Math.PI/3).cp(0, 1, Math.PI/6);

      const cirqCode = exportToCirq(circuit);

      // Use regex to match approximate values due to precision differences
      expect(cirqCode).toMatch(/circuit\.append\(cirq\.ZPowGate\(exponent=1\.047?\d*\/np\.pi\)\(qubits\[0\]\)\)/);
      expect(cirqCode).toMatch(/circuit\.append\(cirq\.CZPowGate\(exponent=0\.524?\d*\/np\.pi\)\(qubits\[0\], qubits\[1\]\)\)/);
    });

    it('should handle full gate names', () => {
      const circuit = new Circuit(2);
      // Test that full names work alongside abbreviations by using direct instructions
      circuit.instructions.push({ gate: { name: 'hadamard' } as any, targets: [0] });
      circuit.instructions.push({ gate: { name: 'paulix' } as any, targets: [1] });
      circuit.instructions.push({ gate: { name: 'controlledz' } as any, targets: [0, 1] });

      const cirqCode = exportToCirq(circuit);

      expect(cirqCode).toContain('circuit.append(cirq.H(qubits[0]))');
      expect(cirqCode).toContain('circuit.append(cirq.X(qubits[1]))');
      expect(cirqCode).toContain('circuit.append(cirq.CZ(qubits[0], qubits[1]))');
    });

    it('should handle unsupported gates gracefully', () => {
      const circuit = new Circuit(1);
      // Add an instruction with an unsupported gate name
      circuit.instructions.push({
        gate: { name: 'unsupported_gate' } as any,
        targets: [0]
      });

      const cirqCode = exportToCirq(circuit);

      // Should not crash and should still contain basic structure
      expect(cirqCode).toContain('qubits = cirq.LineQubit.range(1)');
      // Should not contain the unsupported gate
      expect(cirqCode).not.toContain('unsupported_gate');
    });

    it('should handle three-qubit gates', () => {
      const circuit = new Circuit(3);
      // Add a hypothetical three-qubit gate (should return null and be skipped)
      circuit.instructions.push({
        gate: { name: 'toffoli' } as any,
        targets: [0, 1, 2]
      });

      const cirqCode = exportToCirq(circuit);

      expect(cirqCode).toContain('qubits = cirq.LineQubit.range(3)');
      // Three-qubit gates should be skipped since gateToCirq doesn't handle them
      expect(cirqCode).not.toContain('toffoli');
    });

    it('should handle edge case for gate name with empty parentheses', () => {
      const circuit = new Circuit(1);
      // Add gate with empty parentheses to test split fallback
      circuit.instructions.push({
        gate: { name: '()' } as any,
        targets: [0]
      });

      const cirqCode = exportToCirq(circuit);

      // Should not crash and should contain basic structure
      expect(cirqCode).toContain('qubits = cirq.LineQubit.range(1)');
    });
  });

  describe('Cirq JSON Export', () => {
    it('should export simple circuit to JSON format', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);

      const jsonString = exportToCirqJSON(circuit);
      const jsonData = JSON.parse(jsonString);

      expect(jsonData.cirq_type).toBe('Circuit');
      expect(jsonData.device.cirq_type).toBe('UnconstrainedDevice');
      expect(jsonData.qubits).toHaveLength(2);
      expect(jsonData.qubits[0]).toEqual({ cirq_type: 'LineQubit', x: 0 });
      expect(jsonData.qubits[1]).toEqual({ cirq_type: 'LineQubit', x: 1 });
    });

    it('should group operations into moments correctly', () => {
      const circuit = new Circuit(3);
      circuit.h(0).h(1); // Parallel operations - same moment
      circuit.cnot(0, 1); // Next moment (conflicts with previous qubits)
      circuit.x(2); // Can be in same moment as CNOT (no conflict)

      const jsonString = exportToCirqJSON(circuit);
      const jsonData = JSON.parse(jsonString);

      expect(jsonData.moments).toHaveLength(2);
      
      // First moment should have H gates on qubits 0 and 1
      expect(jsonData.moments[0].operations).toHaveLength(2);
      expect(jsonData.moments[0].operations[0].gate.cirq_type).toBe('H');
      expect(jsonData.moments[0].operations[1].gate.cirq_type).toBe('H');
      
      // Second moment should have CNOT and X
      expect(jsonData.moments[1].operations).toHaveLength(2);
      const gateTypes = jsonData.moments[1].operations.map((op: any) => op.gate.cirq_type);
      expect(gateTypes).toContain('CNOT');
      expect(gateTypes).toContain('X');
    });

    it('should handle sequential operations on same qubit', () => {
      const circuit = new Circuit(1);
      circuit.h(0).x(0).y(0); // All on same qubit, should be in different moments

      const jsonString = exportToCirqJSON(circuit);
      const jsonData = JSON.parse(jsonString);

      expect(jsonData.moments).toHaveLength(3);
      expect(jsonData.moments[0].operations[0].gate.cirq_type).toBe('H');
      expect(jsonData.moments[1].operations[0].gate.cirq_type).toBe('X');
      expect(jsonData.moments[2].operations[0].gate.cirq_type).toBe('Y');
    });

    it('should handle unsupported gates in JSON export', () => {
      const circuit = new Circuit(2);
      circuit.h(0);
      // Add unsupported gate
      circuit.instructions.push({
        gate: { name: 'unsupported' } as any,
        targets: [1]
      });

      const jsonString = exportToCirqJSON(circuit);
      const jsonData = JSON.parse(jsonString);

      // Should only have one moment with H gate, unsupported gate skipped
      expect(jsonData.moments).toHaveLength(1);
      expect(jsonData.moments[0].operations).toHaveLength(1);
      expect(jsonData.moments[0].operations[0].gate.cirq_type).toBe('H');
    });

    it('should handle empty circuit in JSON export', () => {
      const circuit = new Circuit(2);

      const jsonString = exportToCirqJSON(circuit);
      const jsonData = JSON.parse(jsonString);

      expect(jsonData.cirq_type).toBe('Circuit');
      expect(jsonData.moments).toHaveLength(0);
      expect(jsonData.qubits).toHaveLength(2);
    });
  });

  describe('Complex Circuit Examples', () => {
    it('should export Bell state circuit', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);

      const cirqCode = exportToCirq(circuit, {
        includeComments: true,
        includeMeasurements: true,
        includeSimulator: true
      });

      expect(cirqCode).toContain('# Q5M.js exported circuit');
      expect(cirqCode).toContain('circuit.append(cirq.H(qubits[0]))');
      expect(cirqCode).toContain('circuit.append(cirq.CNOT(qubits[0], qubits[1]))');
      expect(cirqCode).toContain('circuit.append([cirq.measure(qubits[0], key=\'q0\'), cirq.measure(qubits[1], key=\'q1\')])');
      expect(cirqCode).toContain('result = simulator.run(circuit, repetitions=1000)');
    });

    it('should export GHZ state circuit', () => {
      const circuit = new Circuit(3);
      circuit.h(0).cnot(0, 1).cnot(1, 2);

      const cirqCode = exportToCirq(circuit, {
        circuitVariableName: 'ghz_circuit',
        qubitType: 'GridQubit',
        includeComments: false
      });

      expect(cirqCode).toContain('ghz_circuit = cirq.Circuit()');
      expect(cirqCode).toContain('qubits.append(cirq.GridQubit(0, 0))');
      expect(cirqCode).toContain('qubits.append(cirq.GridQubit(0, 1))');
      expect(cirqCode).toContain('qubits.append(cirq.GridQubit(1, 0))'); // 3 qubits in 2x2 grid: (0,0), (0,1), (1,0)
      expect(cirqCode).toContain('ghz_circuit.append(cirq.H(qubits[0]))');
      expect(cirqCode).toContain('ghz_circuit.append(cirq.CNOT(qubits[0], qubits[1]))');
      expect(cirqCode).toContain('ghz_circuit.append(cirq.CNOT(qubits[1], qubits[2]))');
      expect(cirqCode).not.toContain('#');
    });

    it('should handle quantum Fourier transform pattern', () => {
      const circuit = new Circuit(3);
      circuit.h(0).phase(1, Math.PI/2).h(1).phase(2, Math.PI/4);

      const cirqCode = exportToCirq(circuit);

      expect(cirqCode).toContain('circuit.append(cirq.H(qubits[0]))');
      expect(cirqCode).toMatch(/circuit\.append\(cirq\.ZPowGate\(exponent=1\.571?\d*\/np\.pi\)\(qubits\[1\]\)\)/);
      expect(cirqCode).toContain('circuit.append(cirq.H(qubits[1]))');
      expect(cirqCode).toMatch(/circuit\.append\(cirq\.ZPowGate\(exponent=0\.785?\d*\/np\.pi\)\(qubits\[2\]\)\)/);
    });

    it('should handle variational circuit with many rotations', () => {
      const circuit = new Circuit(2);
      circuit.rx(0, 0.1).ry(0, 0.2).rz(0, 0.3);
      circuit.rx(1, 0.4).ry(1, 0.5).rz(1, 0.6);
      circuit.cnot(0, 1);

      const cirqCode = exportToCirq(circuit, { includeComments: false });

      expect(cirqCode).toMatch(/circuit\.append\(cirq\.rx\(0\.1\d*\)\(qubits\[0\]\)\)/);
      expect(cirqCode).toMatch(/circuit\.append\(cirq\.ry\(0\.2\d*\)\(qubits\[0\]\)\)/);
      expect(cirqCode).toMatch(/circuit\.append\(cirq\.rz\(0\.3\d*\)\(qubits\[0\]\)\)/);
      expect(cirqCode).toMatch(/circuit\.append\(cirq\.rx\(0\.4\d*\)\(qubits\[1\]\)\)/);
      expect(cirqCode).toMatch(/circuit\.append\(cirq\.ry\(0\.5\d*\)\(qubits\[1\]\)\)/);
      expect(cirqCode).toMatch(/circuit\.append\(cirq\.rz\(0\.6\d*\)\(qubits\[1\]\)\)/);
      expect(cirqCode).toContain('circuit.append(cirq.CNOT(qubits[0], qubits[1]))');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle single qubit circuit edge case', () => {
      const circuit = new Circuit(1);

      const cirqCode = exportToCirq(circuit);
      const jsonString = exportToCirqJSON(circuit);

      expect(cirqCode).toContain('qubits = cirq.LineQubit.range(1)');
      expect(cirqCode).toContain('circuit = cirq.Circuit()');

      const jsonData = JSON.parse(jsonString);
      expect(jsonData.qubits).toHaveLength(1);
      expect(jsonData.moments).toHaveLength(0);
    });

    it('should handle very large circuits', () => {
      const circuit = new Circuit(100);
      for (let i = 0; i < 50; i++) {
        circuit.h(i * 2).cnot(i * 2, i * 2 + 1);
      }

      const cirqCode = exportToCirq(circuit, { 
        qubitType: 'LineQubit',
        includeComments: false 
      });

      expect(cirqCode).toContain('qubits = cirq.LineQubit.range(100)');
      expect(cirqCode).toContain('circuit.append(cirq.H(qubits[0]))');
      expect(cirqCode).toContain('circuit.append(cirq.CNOT(qubits[0], qubits[1]))');
      expect(cirqCode).toContain('circuit.append(cirq.CNOT(qubits[98], qubits[99]))');
    });

    it('should handle all export options combined', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);

      const options: CirqExportOptions = {
        includeImports: true,
        includeComments: true,
        circuitVariableName: 'test_circuit',
        qubitType: 'GridQubit',
        includeMeasurements: true,
        includeSimulator: true
      };

      const cirqCode = exportToCirq(circuit, options);

      expect(cirqCode).toContain('import cirq');
      expect(cirqCode).toContain('import numpy as np');
      expect(cirqCode).toContain('# Q5M.js exported circuit');
      expect(cirqCode).toContain('qubits.append(cirq.GridQubit(0, 0))');
      expect(cirqCode).toContain('qubits.append(cirq.GridQubit(0, 1))');
      expect(cirqCode).toContain('test_circuit = cirq.Circuit()');
      expect(cirqCode).toContain('test_circuit.append(cirq.H(qubits[0]))');
      expect(cirqCode).toContain('test_circuit.append(cirq.CNOT(qubits[0], qubits[1]))');
      expect(cirqCode).toContain('test_circuit.append([cirq.measure(qubits[0], key=\'q0\'), cirq.measure(qubits[1], key=\'q1\')])');
      expect(cirqCode).toContain('result = simulator.run(test_circuit, repetitions=1000)');
    });

    it('should handle GridQubit layout correctly for non-square numbers', () => {
      const circuit = new Circuit(5); // 5 qubits -> should use 3x2 grid (ceil(sqrt(5)) = 3)

      const cirqCode = exportToCirq(circuit, { qubitType: 'GridQubit' });

      expect(cirqCode).toContain('qubits.append(cirq.GridQubit(0, 0))'); // qubit 0
      expect(cirqCode).toContain('qubits.append(cirq.GridQubit(0, 1))'); // qubit 1
      expect(cirqCode).toContain('qubits.append(cirq.GridQubit(0, 2))'); // qubit 2
      expect(cirqCode).toContain('qubits.append(cirq.GridQubit(1, 0))'); // qubit 3
      expect(cirqCode).toContain('qubits.append(cirq.GridQubit(1, 1))'); // qubit 4
    });

    it('should include circuit display suggestion when comments enabled', () => {
      const circuit = new Circuit(1);
      circuit.h(0);

      const cirqCode = exportToCirq(circuit, { includeComments: true });

      expect(cirqCode).toContain('# Display circuit');
      expect(cirqCode).toContain('print(circuit)');
    });
  });
});