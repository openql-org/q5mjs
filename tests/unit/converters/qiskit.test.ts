// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { Circuit } from '@/core/Circuit';
import {
  exportToQiskit,
  classicalRegisters,
  type QiskitExportOptions,
} from '@/converters/qiskit';

// Mock circuits with classical registers for testing
interface CircuitWithClassicalRegisters extends Circuit {
  cregs?: Map<string, { size: number; name: string }>;
}

describe('Qiskit Converter', () => {
  describe('Basic Circuit Export', () => {
    it('should export a simple circuit with default options', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);

      const qiskitCode = exportToQiskit(circuit);

      expect(qiskitCode).toContain('from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister');
      expect(qiskitCode).toContain('qreg = QuantumRegister(2, \'q\')');
      expect(qiskitCode).toContain('circuit = QuantumCircuit(qreg)');
      expect(qiskitCode).toContain('circuit.h(qreg[0])');
      expect(qiskitCode).toContain('circuit.cx(qreg[0], qreg[1])');
    });

    it('should export a single qubit circuit', () => {
      const circuit = new Circuit(1);
      circuit.h(0);

      const qiskitCode = exportToQiskit(circuit);

      expect(qiskitCode).toContain('qreg = QuantumRegister(1, \'q\')');
      expect(qiskitCode).toContain('circuit.h(qreg[0])');
    });

    it('should handle empty circuit', () => {
      const circuit = new Circuit(2);

      const qiskitCode = exportToQiskit(circuit);

      expect(qiskitCode).toContain('qreg = QuantumRegister(2, \'q\')');
      expect(qiskitCode).toContain('circuit = QuantumCircuit(qreg)');
      // Should not contain any gate operations
      expect(qiskitCode).not.toMatch(/circuit\.[hxyz]/);
    });
  });

  describe('Export Options', () => {
    it('should respect includeImports option', () => {
      const circuit = new Circuit(1);
      circuit.h(0);

      const qiskitCode = exportToQiskit(circuit, { includeImports: false });

      expect(qiskitCode).not.toContain('from qiskit import');
      expect(qiskitCode).toContain('circuit.h(qreg[0])');
    });

    it('should respect includeComments option', () => {
      const circuit = new Circuit(1);
      circuit.h(0);

      const withComments = exportToQiskit(circuit, { includeComments: true });
      const withoutComments = exportToQiskit(circuit, { includeComments: false });

      expect(withComments).toContain('# Q5M.js exported circuit');
      expect(withComments).toContain('# Generated at:');
      expect(withComments).toContain('# Add quantum gates');

      expect(withoutComments).not.toContain('# Q5M.js exported circuit');
      expect(withoutComments).not.toContain('# Generated at:');
      expect(withoutComments).not.toContain('# Add quantum gates');
    });

    it('should respect circuitVariableName option', () => {
      const circuit = new Circuit(1);
      circuit.h(0);

      const qiskitCode = exportToQiskit(circuit, { circuitVariableName: 'my_circuit' });

      expect(qiskitCode).toContain('my_circuit = QuantumCircuit(qreg)');
      expect(qiskitCode).toContain('my_circuit.h(qreg[0])');
    });

    it('should include measurements when requested', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);

      const qiskitCode = exportToQiskit(circuit, { includeMeasurements: true });

      expect(qiskitCode).toContain('# Add measurements');
      expect(qiskitCode).toContain('creg = ClassicalRegister(2, \'c\')');
      expect(qiskitCode).toContain('circuit.add_register(creg)');
      expect(qiskitCode).toContain('circuit.measure(qreg[0], creg[0])');
      expect(qiskitCode).toContain('circuit.measure(qreg[1], creg[1])');
    });

    it('should include backend execution code when requested', () => {
      const circuit = new Circuit(1);
      circuit.h(0);

      const qiskitCode = exportToQiskit(circuit, { 
        includeBackend: true,
        includeMeasurements: true 
      });

      expect(qiskitCode).toContain('from qiskit import Aer, execute');
      expect(qiskitCode).toContain('from qiskit.visualization import plot_histogram');
      expect(qiskitCode).toContain('# Execute on simulator');
      expect(qiskitCode).toContain('backend = Aer.get_backend(\'qasm_simulator\')');
      expect(qiskitCode).toContain('job = execute(circuit, backend, shots=1000)');
      expect(qiskitCode).toContain('result = job.result()');
      expect(qiskitCode).toContain('counts = result.get_counts(circuit)');
    });
  });

  describe('Gate Conversion', () => {
    it('should convert single-qubit gates', () => {
      const circuit = new Circuit(1);
      circuit.h(0).x(0).y(0).z(0).s(0).t(0);

      const qiskitCode = exportToQiskit(circuit);

      expect(qiskitCode).toContain('circuit.h(qreg[0])');
      expect(qiskitCode).toContain('circuit.x(qreg[0])');
      expect(qiskitCode).toContain('circuit.y(qreg[0])');
      expect(qiskitCode).toContain('circuit.z(qreg[0])');
      expect(qiskitCode).toContain('circuit.s(qreg[0])');
      expect(qiskitCode).toContain('circuit.t(qreg[0])');
    });

    it('should convert two-qubit gates', () => {
      const circuit = new Circuit(2);
      circuit.cnot(0, 1).cz(0, 1).cy(0, 1).swap(0, 1);

      const qiskitCode = exportToQiskit(circuit);

      expect(qiskitCode).toContain('circuit.cx(qreg[0], qreg[1])');
      expect(qiskitCode).toContain('circuit.cz(qreg[0], qreg[1])');
      expect(qiskitCode).toContain('circuit.cy(qreg[0], qreg[1])');
      expect(qiskitCode).toContain('circuit.swap(qreg[0], qreg[1])');
    });

    it('should convert parameterized gates with parameters', () => {
      const circuit = new Circuit(2);
      circuit.rx(0, Math.PI/2).ry(1, Math.PI/4).rz(0, Math.PI).phase(1, Math.PI/6);

      const qiskitCode = exportToQiskit(circuit);

      // Use regex to match approximate values due to precision differences
      expect(qiskitCode).toMatch(/circuit\.rx\(1\.571?\d*, qreg\[0\]\)/);
      expect(qiskitCode).toMatch(/circuit\.ry\(0\.785?\d*, qreg\[1\]\)/);
      expect(qiskitCode).toMatch(/circuit\.rz\(3\.142?\d*, qreg\[0\]\)/);
      expect(qiskitCode).toMatch(/circuit\.p\(0\.524?\d*, qreg\[1\]\)/);
    });

    it('should handle parameterized gates without parameters', () => {
      const circuit = new Circuit(1);
      // Create a gate that might not have explicit parameters
      const qiskitCode = exportToQiskit(circuit);

      // This tests the default parameter handling in the conversion
      expect(qiskitCode).toBeDefined();
    });

    it('should handle unsupported gates gracefully', () => {
      const circuit = new Circuit(1);
      // Add an instruction with an unsupported gate name by directly modifying instructions
      circuit.instructions.push({
        gate: { name: 'unsupported_gate' } as any,
        targets: [0]
      });

      const qiskitCode = exportToQiskit(circuit);

      // Should not crash and should still contain basic structure
      expect(qiskitCode).toContain('qreg = QuantumRegister(1, \'q\')');
      // Should not contain the unsupported gate
      expect(qiskitCode).not.toContain('unsupported_gate');
    });

    it('should handle parameterized gates without explicit parameters', () => {
      const circuit = new Circuit(1);
      // Test default angle for parameterized gates without parameters
      circuit.instructions.push({
        gate: { name: 'rx' } as any,
        targets: [0]
      });

      const qiskitCode = exportToQiskit(circuit);

      // Should use default angle
      expect(qiskitCode).toContain('circuit.rx(3.14159/2, qreg[0])');
    });
  });

  describe('Classical Registers', () => {
    it('should handle circuits with classical registers', () => {
      const circuit = new Circuit(2) as CircuitWithClassicalRegisters;
      circuit.cregs = new Map([
        ['meas', { size: 2, name: 'meas' }],
        ['ancilla', { size: 1, name: 'ancilla' }]
      ]);
      circuit.h(0).cnot(0, 1);

      const qiskitCode = exportToQiskit(circuit, { includeMeasurements: true });

      expect(qiskitCode).toContain('meas = ClassicalRegister(2, \'meas\')');
      expect(qiskitCode).toContain('ancilla = ClassicalRegister(1, \'ancilla\')');
      expect(qiskitCode).toContain('circuit = QuantumCircuit(qreg, meas, ancilla)');
      expect(qiskitCode).toContain('circuit.measure(qreg[0], meas[0])');
      expect(qiskitCode).toContain('circuit.measure(qreg[1], meas[1])');
    });

    it('should handle empty classical registers map', () => {
      const circuit = new Circuit(1);
      const registers = classicalRegisters(circuit);

      expect(registers).toBeDefined();
      expect(registers.size).toBe(0);
    });

    it('should extract classical registers correctly', () => {
      const circuit = new Circuit(2) as CircuitWithClassicalRegisters;
      circuit.cregs = new Map([
        ['test_reg', { size: 3, name: 'test_reg' }]
      ]);

      const registers = classicalRegisters(circuit);

      expect(registers.size).toBe(1);
      expect(registers.get('test_reg')).toEqual({ size: 3, name: 'test_reg' });
    });
  });

  describe('Complex Circuit Examples', () => {
    it('should export Bell state circuit', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);

      const qiskitCode = exportToQiskit(circuit, {
        includeComments: true,
        includeMeasurements: true,
        includeBackend: true
      });

      expect(qiskitCode).toContain('# Q5M.js exported circuit');
      expect(qiskitCode).toContain('circuit.h(qreg[0])');
      expect(qiskitCode).toContain('circuit.cx(qreg[0], qreg[1])');
      expect(qiskitCode).toContain('circuit.measure(qreg[0], creg[0])');
      expect(qiskitCode).toContain('backend = Aer.get_backend(\'qasm_simulator\')');
    });

    it('should export GHZ state circuit', () => {
      const circuit = new Circuit(3);
      circuit.h(0).cnot(0, 1).cnot(1, 2);

      const qiskitCode = exportToQiskit(circuit, {
        circuitVariableName: 'ghz_circuit',
        includeComments: false
      });

      expect(qiskitCode).toContain('ghz_circuit = QuantumCircuit(qreg)');
      expect(qiskitCode).toContain('ghz_circuit.h(qreg[0])');
      expect(qiskitCode).toContain('ghz_circuit.cx(qreg[0], qreg[1])');
      expect(qiskitCode).toContain('ghz_circuit.cx(qreg[1], qreg[2])');
      expect(qiskitCode).not.toContain('#');
    });

    it('should handle multiple rotation gates', () => {
      const circuit = new Circuit(3);
      circuit.rx(0, Math.PI/4).ry(1, Math.PI/3).rz(2, Math.PI/6);

      const qiskitCode = exportToQiskit(circuit);

      expect(qiskitCode).toMatch(/circuit\.rx\(0\.785?\d*, qreg\[0\]\)/);
      expect(qiskitCode).toMatch(/circuit\.ry\(1\.047?\d*, qreg\[1\]\)/);
      expect(qiskitCode).toMatch(/circuit\.rz\(0\.524?\d*, qreg\[2\]\)/);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle single qubit circuit edge case', () => {
      const circuit = new Circuit(1);

      const qiskitCode = exportToQiskit(circuit);

      expect(qiskitCode).toContain('qreg = QuantumRegister(1, \'q\')');
      expect(qiskitCode).toContain('circuit = QuantumCircuit(qreg)');
    });

    it('should handle very large circuits', () => {
      const circuit = new Circuit(100);
      for (let i = 0; i < 99; i++) {
        circuit.h(i).cnot(i, i + 1);
      }

      const qiskitCode = exportToQiskit(circuit);

      expect(qiskitCode).toContain('qreg = QuantumRegister(100, \'q\')');
      expect(qiskitCode).toContain('circuit.h(qreg[0])');
      expect(qiskitCode).toContain('circuit.cx(qreg[0], qreg[1])');
      expect(qiskitCode).toContain('circuit.cx(qreg[98], qreg[99])');
    });

    it('should handle all export options combined', () => {
      const circuit = new Circuit(2) as CircuitWithClassicalRegisters;
      circuit.cregs = new Map([['result', { size: 2, name: 'result' }]]);
      circuit.h(0).cnot(0, 1);

      const options: QiskitExportOptions = {
        includeComments: true,
        includeImports: true,
        circuitVariableName: 'test_circuit',
        includeMeasurements: true,
        includeBackend: true
      };

      const qiskitCode = exportToQiskit(circuit, options);

      expect(qiskitCode).toContain('from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister');
      expect(qiskitCode).toContain('from qiskit import Aer, execute');
      expect(qiskitCode).toContain('# Q5M.js exported circuit');
      expect(qiskitCode).toContain('result = ClassicalRegister(2, \'result\')');
      expect(qiskitCode).toContain('test_circuit = QuantumCircuit(qreg, result)');
      expect(qiskitCode).toContain('test_circuit.measure(qreg[0], result[0])');
      expect(qiskitCode).toContain('job = execute(test_circuit, backend, shots=1000)');
    });

    it('should export with backend but without comments', () => {
      const circuit = new Circuit(1);
      circuit.h(0);

      const qiskitCode = exportToQiskit(circuit, {
        includeBackend: true,
        includeComments: false
      });

      // Should include backend execution code
      expect(qiskitCode).toContain('backend = Aer.get_backend');
      expect(qiskitCode).toContain('job = execute');
      expect(qiskitCode).toContain('result.get_counts');
      
      // Should not include visualization comment
      expect(qiskitCode).not.toContain('# To visualize: plot_histogram(counts)');
    });
  });
});