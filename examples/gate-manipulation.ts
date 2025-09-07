#!/usr/bin/env tsx
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * Gate Manipulation Examples
 * 
 * This example demonstrates the new BaseCircuit methods for advanced gate manipulation:
 * - insertGate(): Insert gates at specific positions
 * - removeGate(): Remove gates by index
 * - replaceGate(): Replace gates with new ones
 * - addGate(): Add gates at specific column positions
 * - deleteGate(): Delete gates by wire and column
 */

import { Circuit } from '../src';

function demonstrateGateManipulation() {
  console.log('🌟 Q5M.js Gate Manipulation Examples\n');

  // Create a 3-qubit circuit
  const circuit = new Circuit(3);
  
  console.log('📋 Initial empty circuit:');
  console.log(circuit.toString());

  // Add some initial gates using appendGate (traditional method)
  circuit.appendGate('H', 0);      // H on qubit 0
  circuit.appendGate('CNOT', [0, 1]); // CNOT between qubits 0 and 1
  circuit.appendGate('X', 2);      // X on qubit 2
  
  console.log('📋 Circuit after adding initial gates:');
  console.log(circuit.toString());

  // Demonstrate insertGate - insert at specific index position
  console.log('➕ Inserting Y gate at position 1...');
  circuit.insertGate(1, 'Y', 1);
  console.log(circuit.toString());

  // Demonstrate addGate with column positioning
  console.log('🎯 Adding Z gate at column 1 on wire 0...');
  circuit.addGate('Z', 1, 0);
  console.log(circuit.toString());

  // Demonstrate replaceGate - replace gate at specific position
  console.log('🔄 Replacing gate at position 0 with Hadamard on qubit 2...');
  circuit.replaceGate(0, 'H', 2);
  console.log(circuit.toString());

  // Demonstrate multi-qubit gate operations
  console.log('🎭 Adding multi-qubit CNOT gate at column 2 on wires [1,2]...');
  circuit.addGate('CNOT', 2, [1, 2]);
  console.log(circuit.toString());

  // Demonstrate deleteGate by wire and column
  console.log('🗑️ Deleting gate at column 1 on wire 0...');
  circuit.deleteGate(1, 0);
  console.log(circuit.toString());

  // Demonstrate removeGate by index
  console.log('➖ Removing gate at index 2...');
  circuit.removeGate(2);
  console.log(circuit.toString());

  // Execute final circuit to show it works
  console.log('⚡ Executing the final circuit...');
  const result = circuit.execute();
  console.log(`Success: ${result.success}`);
  if (result.success) {
    const probs = result.state.probabilities();
    console.log('📊 Final state probabilities:');
    probs.forEach((prob, i) => {
      if (prob > 1e-6) { // Only show significant probabilities
        console.log(`  |${i.toString(2).padStart(3, '0')}⟩: ${prob.toFixed(4)}`);
      }
    });
  }
}

// Demonstration of edge cases and error handling
function demonstrateEdgeCases() {
  console.log('\n🛡️ Testing Edge Cases and Error Handling\n');

  const circuit = new Circuit(2);
  circuit.appendGate('H', 0);
  circuit.appendGate('X', 1);

  console.log('📋 Initial circuit:');
  console.log(circuit.toString());

  // Test out-of-range operations (should do nothing)
  console.log('🚫 Testing out-of-range operations (should do nothing):');
  
  circuit.insertGate(-1, 'Y', 0);  // Negative index
  circuit.insertGate(10, 'Y', 0);  // Too high index  
  circuit.removeGate(-1);          // Negative index
  circuit.removeGate(10);          // Too high index
  circuit.replaceGate(-1, 'Z', 0); // Negative index
  circuit.replaceGate(10, 'Z', 0); // Too high index
  circuit.deleteGate(-1, 0);       // Negative column
  circuit.deleteGate(10, 0);       // Non-existent column

  console.log('📋 Circuit after out-of-range operations (should be unchanged):');
  console.log(circuit.toString());

  // Test column-based operations with multi-qubit gates
  console.log('🎭 Testing column operations with multi-qubit gates:');
  circuit.addGate('CNOT', 1, [0, 1]); // Add CNOT at column 1
  console.log(circuit.toString());

  circuit.deleteGate(1, [0, 1]); // Delete multi-qubit gate by any wire
  console.log('After deleting multi-qubit gate:');
  console.log(circuit.toString());
}

// Run examples if this file is executed directly
demonstrateGateManipulation();
demonstrateEdgeCases();
