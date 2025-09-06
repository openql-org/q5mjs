#!/usr/bin/env tsx
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Comprehensive example runner for q5m.js
 * 
 * This script runs quantum computing examples organized by category:
 * - tutorials: Step-by-step learning examples
 * - cookbook: Practical recipes and implementations 
 * - showcase: Advanced features and integrations
 * 
 * Usage:
 *   npx tsx run.ts              # Run all examples
 *   npx tsx run.ts tutorials    # Run only tutorial examples
 *   npx tsx run.ts cookbook     # Run only cookbook recipes
 *   npx tsx run.ts showcase     # Run only showcase examples
 */

import { Circuit } from '../src/index.js';

// Import tutorial examples
import { helloQuantum } from './tutorials/01-introduction/hello-quantum.js';
import { singleQubitOperations } from './tutorials/01-introduction/single-qubit.js';
import { demonstratePauliGates } from './tutorials/02-basic-gates/pauli-gates.js';
import { demonstrateHadamard } from './tutorials/02-basic-gates/hadamard.js';
import { demonstrateRotationGates } from './tutorials/02-basic-gates/rotation-gates.js';
import { demonstrateCNOT } from './tutorials/03-multi-qubit/cnot.js';

// Import algorithm examples  
import { demonstrateSimpleSimon } from './tutorials/05-algorithms/simple-simon.js';
import { demonstrateBernsteinVazirani } from './tutorials/05-algorithms/bernstein-vazirani.js';

// Import advanced examples
import { demonstrateSimpleVQE } from './tutorials/06-advanced/simple-vqe.js';
import { demonstrateSimpleQEC } from './tutorials/06-advanced/simple-qec.js';

// Import cookbook recipes
import { demonstrateBellState } from './cookbook/create-bell-state.js';
import { demonstrateToffoli } from './cookbook/build-toffoli.js';
import { demonstrateGrover } from './cookbook/implement-grover.js';
import { demonstrateQFT } from './cookbook/build-qft.js';
import { demonstrateTeleportation } from './cookbook/quantum-teleportation.js';
import { demonstrateGHZState } from './cookbook/create-ghz-state.js';
import { demonstrateDeutschJozsa } from './cookbook/deutsch-jozsa.js';

// Import showcase examples
import { demonstrateExports } from './showcase/export-formats.js';

interface ExampleCategory {
  name: string;
  description: string;
  examples: Array<{
    name: string;
    description: string;
    fn: () => void | Promise<void>;
  }>;
}

const categories: ExampleCategory[] = [
  {
    name: 'tutorials',
    description: 'Step-by-step learning examples',
    examples: [
      {
        name: 'hello-quantum',
        description: 'Your first quantum circuit with superposition',
        fn: helloQuantum
      },
      {
        name: 'single-qubit-operations',
        description: 'Comprehensive single-qubit gate operations',
        fn: singleQubitOperations
      },
      {
        name: 'pauli-gates',
        description: 'Pauli X, Y, Z gates and their properties',
        fn: demonstratePauliGates
      },
      {
        name: 'hadamard-gate',
        description: 'Hadamard gate for superposition and interference',
        fn: demonstrateHadamard
      },
      {
        name: 'rotation-gates',
        description: 'Parameterized rotation gates (Rx, Ry, Rz)',
        fn: demonstrateRotationGates
      },
      {
        name: 'cnot-gate',
        description: 'CNOT gate for entanglement and controlled operations',
        fn: demonstrateCNOT
      },
      {
        name: 'simon-algorithm',
        description: 'Simon\'s algorithm for period finding',
        fn: demonstrateSimpleSimon
      },
      {
        name: 'bernstein-vazirani',
        description: 'Bernstein-Vazirani algorithm for secret string finding',
        fn: demonstrateBernsteinVazirani
      },
      {
        name: 'variational-quantum-eigensolver',
        description: 'VQE for molecular ground state optimization',
        fn: demonstrateSimpleVQE
      },
      {
        name: 'quantum-error-correction',
        description: 'Quantum error correction codes and principles',
        fn: demonstrateSimpleQEC
      }
    ]
  },
  {
    name: 'cookbook',
    description: 'Practical recipes for quantum computing patterns',
    examples: [
      {
        name: 'bell-states',
        description: 'Create and analyze all four Bell states',
        fn: demonstrateBellState
      },
      {
        name: 'toffoli-gate',
        description: 'Construct Toffoli (CCNOT) gate from basic operations',
        fn: demonstrateToffoli
      },
      {
        name: 'grover-search',
        description: 'Grover\'s algorithm for quantum search',
        fn: demonstrateGrover
      },
      {
        name: 'quantum-fourier-transform',
        description: 'QFT implementation and applications',
        fn: demonstrateQFT
      },
      {
        name: 'quantum-teleportation',
        description: 'Quantum teleportation protocol',
        fn: demonstrateTeleportation
      },
      {
        name: 'ghz-states',
        description: 'Create maximally entangled GHZ states',
        fn: demonstrateGHZState
      },
      {
        name: 'deutsch-jozsa',
        description: 'Deutsch-Jozsa algorithm for function classification',
        fn: demonstrateDeutschJozsa
      }
    ]
  },
  {
    name: 'showcase',
    description: 'Advanced features and integration capabilities',
    examples: [
      {
        name: 'export-formats',
        description: 'Export circuits to Qiskit, Cirq, and OpenQASM',
        fn: demonstrateExports
      }
    ]
  }
];

async function runCategory(categoryName: string): Promise<void> {
  const category = categories.find(c => c.name === categoryName);
  if (!category) {
    console.error(`Unknown category: ${categoryName}`);
    console.error(`Available categories: ${categories.map(c => c.name).join(', ')}`);
    return;
  }

  console.log('\n' + '='.repeat(70));
  console.log(`${category.name.toUpperCase()}: ${category.description}`);
  console.log('='.repeat(70));

  for (const example of category.examples) {
    console.log(`\n${'▶'.repeat(3)} Running: ${example.name}`);
    console.log(`Description: ${example.description}`);
    console.log('-'.repeat(50));
    
    try {
      await example.fn();
    } catch (error) {
      console.error(`❌ Error in ${example.name}:`, error);
    }
    
    console.log('\n' + '✨'.repeat(25));
  }
}

async function runAllExamples(): Promise<void> {
  console.log('🚀 Q5M.JS EXAMPLES RUNNER 🚀');
  console.log('='.repeat(70));
  console.log('Comprehensive demonstration of quantum computing with q5m.js');
  
  const totalExamples = categories.reduce((sum, cat) => sum + cat.examples.length, 0);
  console.log(`\nRunning ${totalExamples} examples across ${categories.length} categories:\n`);
  
  // Show overview
  for (const category of categories) {
    console.log(`📁 ${category.name} (${category.examples.length} examples)`);
    console.log(`   ${category.description}`);
    for (const example of category.examples) {
      console.log(`   • ${example.name}: ${example.description}`);
    }
    console.log();
  }
  
  console.log('='.repeat(70));
  console.log('⏱️  Starting execution...\n');
  
  // Run all categories
  for (const category of categories) {
    await runCategory(category.name);
  }
  
  console.log('\n' + '🎉'.repeat(25));
  console.log('ALL EXAMPLES COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(70));
  console.log('\n💡 Next steps:');
  console.log('• Explore individual example files for detailed implementations');
  console.log('• Modify examples to experiment with different quantum circuits');
  console.log('• Check out the full documentation at docs/');
  console.log('• Try running examples with different parameters');
  console.log('\n🔗 Useful links:');
  console.log('• API Documentation: docs/api-overview.md');
  console.log('• Tutorial Series: docs/tutorial/en/');
  console.log('• Getting Started: docs/getting-started.md');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const targetCategory = args[0];
  
  try {
    if (!targetCategory) {
      // Run all examples
      await runAllExamples();
    } else if (categories.some(c => c.name === targetCategory)) {
      // Run specific category
      console.log('🚀 Q5M.JS EXAMPLES RUNNER 🚀');
      await runCategory(targetCategory);
      console.log('\n🎉 Category completed successfully!');
    } else {
      // Show usage
      console.log('Usage: npx tsx run.ts [category]\n');
      console.log('Available categories:');
      for (const category of categories) {
        console.log(`  ${category.name} - ${category.description}`);
        console.log(`    Examples: ${category.examples.map(e => e.name).join(', ')}`);
      }
      console.log('\nRun without arguments to execute all examples.');
    }
  } catch (error) {
    console.error('❌ Error running examples:', error);
    process.exit(1);
  }
  
  // Ensure script exits cleanly
  process.exit(0);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runAllExamples, runCategory, categories };
