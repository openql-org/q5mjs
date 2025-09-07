// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { Circuit } from '@/core/Circuit';
import {
  exportToOpenQASM,
  exportToOpenQASM3,
  getDefaultParameterizedGate,
  gateToOpenQASM,
  type OpenQASMExportOptions,
} from '@/converters/openqasm';

// Mock circuits with classical registers for testing
interface CircuitWithClassicalRegisters extends Circuit {
  cregs?: Map<string, { size: number; name: string }>;
}

describe('OpenQASM Converter', () => {
  describe('Basic Circuit Export (OpenQASM 2.0)', () => {
    it('should export a simple circuit with default options', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);

      const qasmCode = exportToOpenQASM(circuit);

      expect(qasmCode).toContain('OPENQASM 2.0;');
      expect(qasmCode).toContain('include "qelib1.inc";');
      expect(qasmCode).toContain('qreg q[2];');
      expect(qasmCode).toContain('creg c[2];');
      expect(qasmCode).toContain('h q[0];');
      expect(qasmCode).toContain('cx q[0], q[1];');
    });

    it('should export a single qubit circuit', () => {
      const circuit = new Circuit(1);
      circuit.h(0);

      const qasmCode = exportToOpenQASM(circuit);

      expect(qasmCode).toContain('qreg q[1];');
      expect(qasmCode).toContain('creg c[1];');
      expect(qasmCode).toContain('h q[0];');
    });

    it('should handle empty circuit', () => {
      const circuit = new Circuit(2);

      const qasmCode = exportToOpenQASM(circuit);

      expect(qasmCode).toContain('OPENQASM 2.0;');
      expect(qasmCode).toContain('qreg q[2];');
      expect(qasmCode).toContain('creg c[2];');
      // Should not contain any gate operations
      expect(qasmCode).not.toMatch(/[hxyz] q\[\d+\];/);
    });
  });

  describe('OpenQASM 3.0 Export', () => {
    it('should export to OpenQASM 3.0 when requested', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);

      const qasmCode = exportToOpenQASM(circuit, { version: '3.0' });

      expect(qasmCode).toContain('OPENQASM 3.0;');
      expect(qasmCode).toContain('include "stdgates.inc";');
      expect(qasmCode).toContain('qubit[2] q;');
      expect(qasmCode).toContain('bit[2] c;');
      expect(qasmCode).toContain('h q[0];');
      expect(qasmCode).toContain('cx q[0], q[1];');
    });

    it('should export directly via exportToOpenQASM3', () => {
      const circuit = new Circuit(1);
      circuit.x(0);

      const qasmCode = exportToOpenQASM3(circuit);

      expect(qasmCode).toContain('OPENQASM 3.0;');
      expect(qasmCode).toContain('include "stdgates.inc";');
      expect(qasmCode).toContain('qubit[1] q;');
      expect(qasmCode).toContain('bit[1] c;');
      expect(qasmCode).toContain('x q[0];');
    });

    it('should handle measurements in OpenQASM 3.0', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);

      const qasmCode = exportToOpenQASM3(circuit, { includeMeasurements: true });

      expect(qasmCode).toContain('// Measurements');
      expect(qasmCode).toContain('c[0] = measure q[0];');
      expect(qasmCode).toContain('c[1] = measure q[1];');
    });
  });

  describe('Export Options', () => {
    it('should respect includeComments option', () => {
      const circuit = new Circuit(1);
      circuit.h(0);

      const withComments = exportToOpenQASM(circuit, { includeComments: true });
      const withoutComments = exportToOpenQASM(circuit, { includeComments: false });

      expect(withComments).toContain('// Q5M.js exported circuit');
      expect(withComments).toContain('// Generated at:');
      expect(withoutComments).not.toContain('// Q5M.js exported circuit');
      expect(withoutComments).not.toContain('// Generated at:');
    });

    it('should handle includeMeasurements option', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);

      const withMeasurements = exportToOpenQASM(circuit, { includeMeasurements: true });
      const withoutMeasurements = exportToOpenQASM(circuit, { includeMeasurements: false });

      expect(withMeasurements).toContain('// Measurements');
      expect(withMeasurements).toContain('measure q[0] -> c[0];');
      expect(withMeasurements).toContain('measure q[1] -> c[1];');

      expect(withoutMeasurements).not.toContain('// Measurements');
      expect(withoutMeasurements).not.toMatch(/measure q\[\d+\] -> c\[\d+\];/);
    });

    it('should handle version option correctly', () => {
      const circuit = new Circuit(1);
      circuit.h(0);

      const version20 = exportToOpenQASM(circuit, { version: '2.0' });
      const version30 = exportToOpenQASM(circuit, { version: '3.0' });

      expect(version20).toContain('OPENQASM 2.0;');
      expect(version20).toContain('include "qelib1.inc";');
      expect(version20).toContain('qreg q[1];');

      expect(version30).toContain('OPENQASM 3.0;');
      expect(version30).toContain('include "stdgates.inc";');
      expect(version30).toContain('qubit[1] q;');
    });
  });

  describe('Gate Conversion', () => {
    it('should convert single-qubit gates', () => {
      const circuit = new Circuit(1);
      circuit.h(0).x(0).y(0).z(0).s(0).t(0);

      const qasmCode = exportToOpenQASM(circuit);

      expect(qasmCode).toContain('h q[0];');
      expect(qasmCode).toContain('x q[0];');
      expect(qasmCode).toContain('y q[0];');
      expect(qasmCode).toContain('z q[0];');
      expect(qasmCode).toContain('s q[0];');
      expect(qasmCode).toContain('t q[0];');
    });

    it('should convert two-qubit gates', () => {
      const circuit = new Circuit(2);
      circuit.cnot(0, 1).cz(0, 1).cy(0, 1).swap(0, 1);

      const qasmCode = exportToOpenQASM(circuit);

      expect(qasmCode).toContain('cx q[0], q[1];');
      expect(qasmCode).toContain('cz q[0], q[1];');
      expect(qasmCode).toContain('cy q[0], q[1];');
      expect(qasmCode).toContain('swap q[0], q[1];');
    });

    it('should convert parameterized gates with parameters', () => {
      const circuit = new Circuit(2);
      circuit.rx(0, Math.PI/2).ry(1, Math.PI/4).rz(0, Math.PI).phase(1, Math.PI/6);

      const qasmCode = exportToOpenQASM(circuit);

      // Check for approximate values due to precision differences
      expect(qasmCode).toMatch(/rx\(1\.571?\d*\) q\[0\];/);
      expect(qasmCode).toMatch(/ry\(0\.785?\d*\) q\[1\];/);
      expect(qasmCode).toMatch(/rz\(3\.142?\d*\) q\[0\];/);
      expect(qasmCode).toMatch(/p\(0\.524?\d*\) q\[1\];/);
    });

    it('should handle gate name mapping correctly', () => {
      expect(gateToOpenQASM('hadamard', [0])).toBe('h q[0]');
      expect(gateToOpenQASM('paulix', [1])).toBe('x q[1]');
      expect(gateToOpenQASM('pauliy', [2])).toBe('y q[2]');
      expect(gateToOpenQASM('pauliz', [0])).toBe('z q[0]');
      expect(gateToOpenQASM('sgate', [1])).toBe('s q[1]');
      expect(gateToOpenQASM('tgate', [2])).toBe('t q[2]');
      expect(gateToOpenQASM('controlledz', [0, 1])).toBe('cz q[0], q[1]');
      expect(gateToOpenQASM('controlledy', [1, 2])).toBe('cy q[1], q[2]');
    });

    it('should handle parameterized gates correctly', () => {
      expect(gateToOpenQASM('rx(1.5708)', [0])).toBe('rx(1.5708) q[0]');
      expect(gateToOpenQASM('ry(0.7854)', [1])).toBe('ry(0.7854) q[1]');
      expect(gateToOpenQASM('rz(3.1416)', [2])).toBe('rz(3.1416) q[2]');
      expect(gateToOpenQASM('phase(1.0)', [0])).toBe('p(1.0) q[0]');
      expect(gateToOpenQASM('controlledphase(0.5)', [0, 1])).toBe('cp(0.5) q[0], q[1]');
    });

    it('should provide default parameters for parameterized gates', () => {
      expect(getDefaultParameterizedGate('rx', 'q[0]')).toBe('rx(pi/2) q[0]');
      expect(getDefaultParameterizedGate('ry', 'q[1]')).toBe('ry(pi/2) q[1]');
      expect(getDefaultParameterizedGate('rz', 'q[2]')).toBe('rz(pi/2) q[2]');
      expect(getDefaultParameterizedGate('p', 'q[0]')).toBe('p(pi/2) q[0]');
      expect(getDefaultParameterizedGate('cp', 'q[0], q[1]')).toBe('cp(pi/2) q[0], q[1]');
      expect(getDefaultParameterizedGate('h', 'q[0]')).toBeNull();
    });

    it('should handle unsupported gates gracefully', () => {
      expect(gateToOpenQASM('unsupported_gate', [0])).toBeNull();
      expect(gateToOpenQASM('unknown', [0, 1])).toBeNull();
    });

    it('should use default parameters for parameterized gates without parameters', () => {
      // Test getDefaultParameterizedGate return functionality
      expect(gateToOpenQASM('rx', [0])).toBe('rx(pi/2) q[0]');
      expect(gateToOpenQASM('ry', [1])).toBe('ry(pi/2) q[1]');
      expect(gateToOpenQASM('rz', [2])).toBe('rz(pi/2) q[2]');
      expect(gateToOpenQASM('phase', [0])).toBe('p(pi/2) q[0]');
      expect(gateToOpenQASM('controlledphase', [0, 1])).toBe('cp(pi/2) q[0], q[1]');
    });

    it('should handle edge cases for gate name parsing', () => {
      // Test empty baseGate case - when gate.split('(')[0] returns empty string
      expect(gateToOpenQASM('()', [0])).toBeNull();
      
      // Test baseGate fallback when split returns empty
      expect(gateToOpenQASM('(param)', [0])).toBeNull();
    });
  });

  describe('Measurement Gates', () => {
    it('should handle Z-basis measurements', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1).mz(0).mz(1);

      const qasmCode = exportToOpenQASM(circuit);

      expect(qasmCode).toContain('// Measurements');
      expect(qasmCode).toContain('measure q[0] -> c[0];');
      expect(qasmCode).toContain('measure q[1] -> c[1];');
    });

    it('should handle X-basis measurements with rotation', () => {
      const circuit = new Circuit(1);
      circuit.h(0).mx(0);

      const qasmCode = exportToOpenQASM(circuit);

      expect(qasmCode).toContain('// Measurement basis rotations');
      expect(qasmCode).toContain('h q[0];'); // Basis rotation for X measurement
      expect(qasmCode).toContain('measure q[0] -> c[0];');
    });

    it('should handle Y-basis measurements with rotation', () => {
      const circuit = new Circuit(1);
      circuit.h(0).my(0);

      const qasmCode = exportToOpenQASM(circuit);

      expect(qasmCode).toContain('// Measurement basis rotations');
      expect(qasmCode).toContain('sdg q[0];'); // First rotation for Y measurement
      expect(qasmCode).toContain('h q[0];'); // Second rotation for Y measurement
      expect(qasmCode).toContain('measure q[0] -> c[0];');
    });
  });

  describe('Classical Registers', () => {
    it('should handle circuits with existing classical registers', () => {
      const circuit = new Circuit(2) as CircuitWithClassicalRegisters;
      circuit.cregs = new Map([
        ['measurement', { size: 2, name: 'measurement' }],
        ['ancilla', { size: 1, name: 'ancilla' }]
      ]);
      circuit.h(0).cnot(0, 1);

      const qasmCode = exportToOpenQASM(circuit, { includeMeasurements: true });

      expect(qasmCode).toContain('creg measurement[2];');
      expect(qasmCode).toContain('creg ancilla[1];');
      expect(qasmCode).toContain('measure q[0] -> measurement[0];');
      expect(qasmCode).toContain('measure q[1] -> measurement[1];');
    });

    it('should handle classical registers in OpenQASM 3.0', () => {
      const circuit = new Circuit(2) as CircuitWithClassicalRegisters;
      circuit.cregs = new Map([
        ['result', { size: 2, name: 'result' }]
      ]);
      circuit.h(0).cnot(0, 1);

      const qasmCode = exportToOpenQASM3(circuit, { includeMeasurements: true });

      expect(qasmCode).toContain('bit[2] result;');
      expect(qasmCode).toContain('result[0] = measure q[0];');
      expect(qasmCode).toContain('result[1] = measure q[1];');
    });

    it('should handle unsupported gates in OpenQASM 3.0', () => {
      const circuit = new Circuit(1);
      circuit.instructions.push({
        gate: { name: 'unsupported_gate_3' } as any,
        targets: [0]
      });

      const qasmCode = exportToOpenQASM3(circuit);

      // Should not contain the unsupported gate (returns null)
      expect(qasmCode).not.toContain('unsupported_gate_3');
      expect(qasmCode).toContain('OPENQASM 3.0;');
    });

    it('should handle parameterized gates in OpenQASM 3.0', () => {
      const circuit = new Circuit(2);
      
      // Test parameterized gates with parameters
      circuit.instructions.push({
        gate: { name: 'rx(1.5708)' } as any,
        targets: [0]
      });
      
      // Test parameterized gates without parameters
      circuit.instructions.push({
        gate: { name: 'ry' } as any,
        targets: [1]
      });

      const qasmCode = exportToOpenQASM3(circuit);

      expect(qasmCode).toContain('rx(1.5708) q[0];');
      expect(qasmCode).toContain('ry(pi/2) q[1];');
    });

    it('should handle edge cases for gate parsing in OpenQASM 3.0', () => {
      const circuit = new Circuit(1);
      
      // Test empty baseGate case in OpenQASM 3.0
      circuit.instructions.push({
        gate: { name: '()' } as any,
        targets: [0]
      });

      const qasmCode = exportToOpenQASM3(circuit);

      // Should not contain the invalid gate, but should still be valid QASM
      expect(qasmCode).not.toContain('() q[0];');
      expect(qasmCode).toContain('OPENQASM 3.0;');
    });

    it('should use default classical register when none exist', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);

      const qasm2 = exportToOpenQASM(circuit, { includeMeasurements: true });
      const qasm3 = exportToOpenQASM3(circuit, { includeMeasurements: true });

      expect(qasm2).toContain('creg c[2];');
      expect(qasm2).toContain('measure q[0] -> c[0];');

      expect(qasm3).toContain('bit[2] c;');
      expect(qasm3).toContain('c[0] = measure q[0];');
    });
  });

  describe('Complex Circuit Examples', () => {
    it('should export Bell state circuit', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);

      const qasmCode = exportToOpenQASM(circuit, {
        includeComments: true,
        includeMeasurements: true
      });

      expect(qasmCode).toContain('// Q5M.js exported circuit');
      expect(qasmCode).toContain('h q[0];');
      expect(qasmCode).toContain('cx q[0], q[1];');
      expect(qasmCode).toContain('measure q[0] -> c[0];');
      expect(qasmCode).toContain('measure q[1] -> c[1];');
    });

    it('should export GHZ state circuit', () => {
      const circuit = new Circuit(3);
      circuit.h(0).cnot(0, 1).cnot(1, 2);

      const qasmCode = exportToOpenQASM(circuit, {
        version: '3.0',
        includeComments: false
      });

      expect(qasmCode).toContain('OPENQASM 3.0;');
      expect(qasmCode).toContain('h q[0];');
      expect(qasmCode).toContain('cx q[0], q[1];');
      expect(qasmCode).toContain('cx q[1], q[2];');
      expect(qasmCode).not.toContain('//');
    });

    it('should handle quantum Fourier transform pattern', () => {
      const circuit = new Circuit(3);
      circuit.h(0).phase(1, Math.PI/2).h(1).phase(2, Math.PI/4).phase(1, Math.PI/2).h(2);

      const qasmCode = exportToOpenQASM(circuit);

      expect(qasmCode).toContain('h q[0];');
      expect(qasmCode).toMatch(/p\(1\.571?\d*\) q\[1\];/);
      expect(qasmCode).toContain('h q[1];');
      expect(qasmCode).toMatch(/p\(0\.785?\d*\) q\[2\];/);
      expect(qasmCode).toContain('h q[2];');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle single qubit circuit edge case', () => {
      const circuit = new Circuit(1);

      const qasmCode = exportToOpenQASM(circuit);

      expect(qasmCode).toContain('OPENQASM 2.0;');
      expect(qasmCode).toContain('qreg q[1];');
      expect(qasmCode).toContain('creg c[1];');
    });

    it('should handle very large circuits', () => {
      const circuit = new Circuit(50);
      for (let i = 0; i < 25; i++) {
        circuit.h(i * 2).cnot(i * 2, i * 2 + 1);
      }

      const qasmCode = exportToOpenQASM(circuit);

      expect(qasmCode).toContain('qreg q[50];');
      expect(qasmCode).toContain('h q[0];');
      expect(qasmCode).toContain('cx q[0], q[1];');
      expect(qasmCode).toContain('cx q[48], q[49];');
    });

    it('should handle all export options combined', () => {
      const circuit = new Circuit(2) as CircuitWithClassicalRegisters;
      circuit.cregs = new Map([['measurements', { size: 2, name: 'measurements' }]]);
      circuit.h(0).cnot(0, 1);

      const options: OpenQASMExportOptions = {
        includeComments: true,
        version: '2.0',
        includeMeasurements: true
      };

      const qasmCode = exportToOpenQASM(circuit, options);

      expect(qasmCode).toContain('OPENQASM 2.0;');
      expect(qasmCode).toContain('// Q5M.js exported circuit');
      expect(qasmCode).toContain('creg measurements[2];');
      expect(qasmCode).toContain('h q[0];');
      expect(qasmCode).toContain('cx q[0], q[1];');
      expect(qasmCode).toContain('measure q[0] -> measurements[0];');
      expect(qasmCode).toContain('measure q[1] -> measurements[1];');
    });

    it('should handle circuits with mixed measurement and includeMeasurements', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1).mz(0);

      // Even with includeMeasurements: false, explicit measurements should be included
      const qasmCode = exportToOpenQASM(circuit, { includeMeasurements: false });

      expect(qasmCode).toContain('measure q[0] -> c[0];');
      // But q[1] should not be measured since it's not explicit and includeMeasurements is false
      expect(qasmCode).not.toContain('measure q[1] -> c[1];');
    });
  });
});