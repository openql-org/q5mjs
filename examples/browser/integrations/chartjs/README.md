# Chart.js Integration

This directory contains a comprehensive quantum measurement statistics visualization using Chart.js and Q5M.js, providing intuitive and professional charts for analyzing quantum measurement data.

## Example Overview

### Quantum Measurement Statistics (`measurement-stats.html`)
A complete measurement analysis dashboard with multiple chart types and statistical tools.

**Key Features:**

#### 🎯 **Measurement Campaign System**
- **Configurable Measurements**: Set shots per run (100-10,000) and number of runs (1-100)
- **Multiple Measurement Bases**: Computational (Z), Hadamard (X), and Circular (Y) basis measurements
- **Progress Tracking**: Real-time progress bars and status updates during measurement campaigns
- **Automated Execution**: Asynchronous measurement processing with user-controlled stopping

#### 📊 **Comprehensive Chart Suite**
1. **Measurement Distribution**: Bar charts comparing observed frequencies vs. theoretical probabilities
2. **Run-by-Run Results**: Line charts tracking probability evolution across measurement runs
3. **Statistical Convergence**: Convergence analysis showing measurement accuracy improvement over time
4. **Error Analysis**: Scatter plots visualizing measurement errors and statistical fluctuations

#### 🔧 **Interactive Controls**
- **Quantum System Setup**: 1-4 qubit systems with configurable initial states
- **Circuit Construction**: Complete gate library including single and two-qubit operations
- **Real-time Analysis**: Auto-updating charts with toggle controls
- **Data Management**: Export results and clear data functionality

#### 📈 **Statistical Analysis**
- **Fidelity Calculations**: Comparison between theoretical and observed probability distributions
- **Confidence Intervals**: Visual representation of measurement uncertainty
- **Standard Deviation Tracking**: Statistical spread analysis across measurement runs
- **Convergence Metrics**: Analysis of how measurements approach theoretical predictions

## Technical Implementation

### Chart.js Integration
The example uses Chart.js 4.4.0 with custom configurations optimized for quantum data visualization:

```javascript
// Example chart configuration
const distributionChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: quantumStates,
        datasets: [{
            label: 'Observed Frequency',
            data: observedData,
            backgroundColor: '#3498db80',
            borderColor: '#3498db',
            borderWidth: 1
        }, {
            label: 'Theoretical Probability',
            data: theoreticalData,
            backgroundColor: '#e74c3c80',
            borderColor: '#e74c3c',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        // Custom quantum-specific options...
    }
});
```

### Data Processing Pipeline
1. **Quantum Circuit Execution**: Q5M.js generates theoretical probability distributions
2. **Measurement Simulation**: Probabilistic sampling based on quantum amplitudes
3. **Statistical Aggregation**: Collection and analysis of measurement runs
4. **Chart Data Preparation**: Transformation to Chart.js compatible formats
5. **Real-time Updates**: Efficient chart updates during measurement campaigns

### Chart Types and Use Cases

#### Bar Charts (Distribution Analysis)
- **Purpose**: Compare theoretical vs. observed probability distributions
- **Features**: Side-by-side comparison, confidence intervals, interactive tooltips
- **Best For**: Understanding measurement accuracy and quantum state analysis

#### Line Charts (Time Series Analysis)
- **Purpose**: Track probability evolution across measurement runs
- **Features**: Multi-series data, smooth animations, zoom/pan capabilities
- **Best For**: Observing statistical convergence and run-to-run variations

#### Scatter Plots (Error Analysis)
- **Purpose**: Visualize measurement errors and statistical fluctuations
- **Features**: Point clustering, trend analysis, outlier identification
- **Best For**: Quality assessment and noise analysis

## Getting Started

### Basic Usage
1. **Open the HTML file** in a modern web browser
2. **Configure the quantum system** (number of qubits, initial state)
3. **Build a quantum circuit** using the gate controls
4. **Start a measurement campaign** with desired parameters
5. **Analyze results** using the four chart panels

### Quick Start Example
```javascript
// Example: Create Bell state and measure
1. Set "Number of Qubits" to 2
2. Select "Initial State": |00⟩
3. Click "H" gate (target qubit 0)
4. Set control=0, target=1, click "CNOT"
5. Set "Shots per Run": 1000
6. Set "Number of Runs": 20
7. Click "Start Measurement Campaign"
```

### Customization Options

#### Measurement Parameters
- **Shots per Run**: Higher values provide better statistics but slower execution
- **Number of Runs**: More runs improve convergence analysis
- **Measurement Basis**: Different bases reveal different quantum properties

#### Chart Appearance
- **Color Schemes**: Modify `chartColors` object for custom themes
- **Animation Speed**: Adjust Chart.js animation duration
- **Data Point Styling**: Customize markers, lines, and fills

#### Analysis Features
- **Confidence Intervals**: Toggle statistical error bars
- **Theoretical Comparison**: Show/hide expected values
- **Auto-updating**: Enable/disable real-time chart updates

## Advanced Features

### Statistical Measures

#### Fidelity Calculation
The fidelity between observed and theoretical distributions is calculated as:
```javascript
function calculateFidelity(observed, theoretical) {
    let fidelity = 0;
    for (let i = 0; i < observed.length; i++) {
        fidelity += Math.sqrt(observed[i] * theoretical[i]);
    }
    return fidelity;
}
```

#### Convergence Analysis
Tracks how measurement accuracy improves with increasing sample size:
- **Running Average Fidelity**: Shows convergence to theoretical predictions
- **Standard Deviation Trends**: Demonstrates statistical uncertainty reduction
- **Error Analysis**: Visualizes measurement noise and systematic errors

### Measurement Basis Options

#### Computational Basis (Z)
Standard quantum measurement in the |0⟩, |1⟩ basis:
```javascript
function simulateComputationalMeasurement() {
    const rand = Math.random();
    let cumulativeProb = 0;
    
    for (let state = 0; state < numStates; state++) {
        const amp = currentState.getAmplitude(state);
        cumulativeProb += amp.magnitude() ** 2;
        if (rand <= cumulativeProb) return state;
    }
}
```

#### Hadamard Basis (X)
Measurement in the |+⟩, |-⟩ basis (requires basis transformation):
- Useful for analyzing superposition states
- Reveals different quantum properties than computational basis
- Important for quantum communication protocols

#### Circular Basis (Y)
Measurement in the |↻⟩, |↺⟩ basis:
- Sensitive to quantum phase relationships
- Used in advanced quantum algorithms
- Provides complementary information to Z and X measurements

### Data Export and Integration

#### Export Formats
The measurement results can be exported in JSON format containing:
```json
{
    "metadata": {
        "numQubits": 2,
        "numRuns": 20,
        "totalMeasurements": 20000,
        "timestamp": "2024-01-15T10:30:00.000Z"
    },
    "statistics": {
        "averageFidelity": 0.987,
        "standardDeviation": 0.023
    },
    "runs": [
        {
            "runIndex": 0,
            "shots": 1000,
            "counts": [247, 253, 251, 249],
            "probabilities": [0.247, 0.253, 0.251, 0.249],
            "theoreticalProbs": [0.25, 0.25, 0.25, 0.25],
            "fidelity": 0.999
        }
        // ... more runs
    ]
}
```

## Educational Applications

### Quantum Computing Courses
- **Measurement Theory**: Understand the probabilistic nature of quantum measurements
- **Statistical Analysis**: Learn how repeated measurements reveal quantum properties
- **Error Analysis**: Understand measurement uncertainty and noise effects
- **Basis Transformations**: Explore how different measurement bases reveal different information

### Research Applications
- **Algorithm Validation**: Verify quantum algorithm implementations
- **Noise Characterization**: Analyze measurement errors and systematic biases
- **Statistical Benchmarking**: Compare theoretical predictions with experimental results
- **Parameter Optimization**: Use measurement statistics to optimize quantum circuits

### Classroom Activities
1. **Bell State Analysis**: Create and measure Bell states, observe perfect correlations
2. **Superposition Verification**: Measure Hadamard states in different bases
3. **Noise Simulation**: Add artificial noise and observe statistical effects
4. **Convergence Studies**: Investigate how measurement accuracy improves with sample size

## Performance and Scalability

### Recommended Parameters
- **Small Systems (1-2 qubits)**: Up to 10,000 shots, 100 runs
- **Medium Systems (3 qubits)**: Up to 5,000 shots, 50 runs  
- **Large Systems (4+ qubits)**: Up to 1,000 shots, 20 runs

### Memory Management
- **Automatic cleanup** of measurement data between campaigns
- **Progressive loading** during long measurement sequences
- **Efficient chart updates** using Chart.js optimizations

### Performance Optimization
```javascript
// Batch processing for large measurement campaigns
async function performMeasurementRun(numShots, runIndex) {
    // Process measurements in chunks to prevent UI blocking
    const chunkSize = 1000;
    for (let chunk = 0; chunk < numShots; chunk += chunkSize) {
        const batchSize = Math.min(chunkSize, numShots - chunk);
        // Process batch...
        await new Promise(resolve => setTimeout(resolve, 10)); // Yield control
    }
}
```

## Browser Compatibility

**Supported Browsers:**
- Chrome/Edge 88+ (recommended for best performance)
- Firefox 85+
- Safari 14+

**Requirements:**
- Canvas support for Chart.js rendering
- Promise/async support for measurement campaigns
- Modern JavaScript (ES6+) features

## Troubleshooting

### Common Issues

**Charts not displaying:**
- Check browser console for JavaScript errors
- Verify Chart.js CDN is loading correctly
- Ensure canvas elements have proper dimensions

**Slow measurement campaigns:**
- Reduce number of shots or runs
- Close other browser tabs consuming resources
- Use recommended parameters for your system size

**Memory issues with large datasets:**
- Clear data regularly using "Clear All Data" button
- Reduce measurement parameters for complex circuits
- Monitor browser memory usage in developer tools

### Performance Tips
- **Use batch processing** for very large measurement campaigns
- **Enable auto-updating** only when needed
- **Export data regularly** to prevent memory buildup
- **Close unused browser tabs** during intensive measurements

## Development and Extension

### Adding Custom Chart Types
```javascript
function createCustomChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    return new Chart(ctx, {
        type: 'customType', // or existing type
        data: customData,
        options: {
            // Custom configuration
            plugins: {
                // Custom plugins
            }
        }
    });
}
```

### Custom Statistical Measures
```javascript
function calculateCustomMetric(measurementData) {
    // Implement custom statistical analysis
    return customValue;
}
```

### Integration with Other Tools
The Chart.js visualization can be extended to work with:
- **Jupyter notebooks** (iframe embedding)
- **Educational platforms** (LTI integration)
- **Research pipelines** (data export/import)
- **Custom quantum simulators** (API integration)

## Resources

- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [Q5M.js API Reference](https://github.com/your-repo/q5mjs)
- [Quantum Measurement Theory](https://qiskit.org/textbook/ch2/2_the_bloch_sphere.html)
- [Statistical Analysis in Quantum Computing](https://arxiv.org/abs/quant-ph/0101113)