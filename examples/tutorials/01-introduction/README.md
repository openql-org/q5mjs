# Tutorial 01: Introduction to Quantum Computing with q5m.js

This directory contains introductory examples to get you started with quantum computing using q5m.js.

## Examples

### 1. hello-quantum.ts
Your first quantum circuit! Creates a single qubit and applies a Hadamard gate to create a superposition state.

**Key Concepts:**
- Creating a quantum circuit
- Applying quantum gates
- Understanding superposition
- Measuring quantum states

**Run:**
```bash
npx tsx hello-quantum.ts
```

### 2. single-qubit.ts
Explores various single-qubit operations including Pauli gates, Hadamard, phase gates, and rotation gates.

**Key Concepts:**
- Pauli gates (X, Y, Z)
- Hadamard gate for superposition
- Phase gates (S, T)
- Rotation gates (Rx, Ry, Rz)
- Gate sequences and combinations

**Run:**
```bash
npx tsx single-qubit.ts
```

## Learning Path

1. Start with `hello-quantum.ts` to understand the basics
2. Move to `single-qubit.ts` to explore different gates
3. Continue to Tutorial 02 for multi-qubit operations

## Theory Background

### Qubit States
A qubit can be in state |0⟩, |1⟩, or a superposition of both:
```
|ψ⟩ = α|0⟩ + β|1⟩
```
where |α|² + |β|² = 1

### Common Gates

| Gate | Symbol | Action |
|------|--------|--------|
| Hadamard | H | Creates superposition: \|0⟩ → (\|0⟩ + \|1⟩)/√2 |
| Pauli-X | X | Bit flip: \|0⟩ → \|1⟩, \|1⟩ → \|0⟩ |
| Pauli-Y | Y | Bit and phase flip |
| Pauli-Z | Z | Phase flip: \|1⟩ → -\|1⟩ |
| Phase | S | Adds π/2 phase to \|1⟩ |
| T | T | Adds π/4 phase to \|1⟩ |

## Related Documentation
- [Getting Started Guide](../../../docs/getting-started.md)
- [API Overview](../../../docs/api-overview.md)
- [Basic Gates Tutorial](../../../docs/tutorial/en/02-basic-gates.md)