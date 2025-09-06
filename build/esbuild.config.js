// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

// Advanced optimization plugins
const createOptimizationPlugin = () => {
  return {
    name: 'quantum-optimizations',
    setup(build) {
      // Remove development-only code
      build.onResolve({ filter: /\/dev\// }, () => {
        return { path: '', namespace: 'empty' };
      });
      
      // Optimize visualization for smaller core bundle
      build.onResolve({ filter: /visualization\/(MeasurementRenderer|StateRenderer|CircuitRenderer)\.ts$/ }, () => {
        return { path: '', namespace: 'empty-stub' };
      });
      
      // Optimize algorithms for smaller core bundle
      build.onResolve({ filter: /algorithms\/(grover|qft|phase-estimation|amplitude-amplification)\.ts$/ }, () => {
        return { path: '', namespace: 'empty-stub' };
      });
      
      // Optimize converters for smaller core bundle  
      build.onResolve({ filter: /converters\/(cirq|openqasm|qiskit)\.ts$/ }, () => {
        return { path: '', namespace: 'empty-stub' };
      });
      
      // Remove unused exports and imports for tree shaking
      build.onResolve({ filter: /Q5mSystem\.ts$/ }, () => {
        return { path: '', namespace: 'empty' };
      });
      
      build.onLoad({ filter: /.*/, namespace: 'empty' }, () => {
        return { contents: 'export {}' };
      });
      
      build.onLoad({ filter: /.*/, namespace: 'empty-stub' }, () => {
        return { 
          contents: `
            export const placeholder = () => {
              throw new Error('This module requires dynamic import. Use loadVisualization() instead.');
            };
            export default placeholder;
          ` 
        };
      });
    },
  };
};

// Core bundle specific optimization plugin
const createCoreOptimizationPlugin = () => {
  return {
    name: 'core-optimizations',
    setup(build) {
      // Make complex.js external
      build.onResolve({ filter: /complex\.js$/ }, () => {
        return { path: 'complex.js', external: true };
      });
      
      
      // Remove heavy dependencies from core bundle
      build.onResolve({ filter: /Measurement\.ts$/ }, () => {
        return { path: '', namespace: 'empty' };
      });
      
      // Remove Q5mOperator from core for additional size savings
      build.onResolve({ filter: /Q5mOperator\.ts$/ }, () => {
        return { path: '', namespace: 'empty' };
      });
      
      // Remove multi-qubit gates from core
      build.onResolve({ filter: /MultiQubitGates\.ts$/ }, () => {
        return { path: '', namespace: 'empty' };
      });
      
      // Remove two-qubit gates from core for ultra-minimal size
      build.onResolve({ filter: /TwoQubitGates\.ts$/ }, () => {
        return { path: '', namespace: 'empty' };
      });
      
      // Remove measurement gates from core
      build.onResolve({ filter: /MeasureGates\.ts$/ }, () => {
        return { path: '', namespace: 'empty' };
      });
      
      // Remove CircuitExecutor from core
      build.onResolve({ filter: /CircuitExecutor\.ts$/ }, () => {
        return { path: '', namespace: 'empty' };
      });

      // Additional aggressive exclusions for core size reduction
      build.onResolve({ filter: /Q5mMaterial\.ts$/ }, () => {
        return { path: '', namespace: 'empty' };
      });

      build.onResolve({ filter: /hermitian\.ts$/ }, () => {
        return { path: '', namespace: 'empty' };
      });

      build.onResolve({ filter: /Gate\.ts$/ }, () => {
        return { path: '', namespace: 'empty' };
      });

      // Remove angle utilities (3.5KB)
      build.onResolve({ filter: /angle\.ts$/ }, () => {
        return { path: '', namespace: 'empty' };
      });

      // Remove BaseCircuit entirely to save 1KB + eliminate CircuitExecutor dependency
      build.onResolve({ filter: /BaseCircuit\.ts$/ }, () => {
        return { path: '', namespace: 'empty' };
      });
    },
  };
};

// Build configurations
const builds = [
  // Core bundle (essential components only)
  {
    name: 'core',
    entryPoints: ['src/core-entry.ts'],
    outfile: 'dist/q5m.core.js',
    format: 'esm',
    bundle: true,
    minify: true,
    sourcemap: false, // Remove sourcemap to save size
    treeShaking: true,
    platform: 'neutral',
    external: [], // Bundle everything for optimal tree-shaking
    splitting: false,
    plugins: [createOptimizationPlugin(), createCoreOptimizationPlugin()], // Use both optimization plugins
    mangleProps: /^_/,
    reserveProps: /^__/,
    drop: ['console', 'debugger'], // Remove debug code
    pure: ['console.log', 'console.info', 'console.debug', 'console.warn'],
    legalComments: 'none', // Remove license comments
    keepNames: false, // Allow function name mangling
    charset: 'utf8',
    mainFields: ['module', 'main'],
    minifyWhitespace: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    define: {
      'process.env.NODE_ENV': '"production"',
      '__DEV__': 'false',
      'DEBUG': 'false',
      'NODE_ENV': '"production"',
    },
  },
  
  // Full ESM bundle
  {
    name: 'esm',
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.mjs',
    format: 'esm',
    bundle: true,
    minify: true,
    sourcemap: true,
    treeShaking: true,
    platform: 'neutral',
    splitting: false,
    plugins: [createOptimizationPlugin()],
    mangleProps: /^_/,
    reserveProps: /^__/,
    drop: ['console', 'debugger'],
    pure: ['console.log', 'console.info', 'console.debug'],
    legalComments: 'none',
    ignoreAnnotations: false,
    keepNames: false,
    charset: 'utf8',
    mainFields: ['module', 'main'],
    define: {
      'process.env.NODE_ENV': '"production"',
      '__DEV__': 'false',
      'DEBUG': 'false',
    },
  },
  
  // Node.js CommonJS bundle
  {
    name: 'cjs',
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    format: 'cjs',
    bundle: true,
    minify: true,
    sourcemap: true,
    platform: 'node',
    target: 'node18',
    treeShaking: true,
    plugins: [createOptimizationPlugin()],
    mangleProps: /^_/,
    reserveProps: /^__/,
    drop: ['console', 'debugger'],
    pure: ['console.log', 'console.info', 'console.debug'],
    legalComments: 'none',
    keepNames: false,
    charset: 'utf8',
    mainFields: ['module', 'main'],
    minifyWhitespace: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    define: {
      'process.env.NODE_ENV': '"production"',
      '__DEV__': 'false',
      'DEBUG': 'false',
    },
  },
  
  // Browser UMD bundle (includes all features for E2E testing)
  {
    name: 'umd',
    entryPoints: ['src/index.ts'], // Use main index with all features
    outfile: 'dist/q5m.umd.js',
    format: 'iife',
    globalName: 'Q5M',
    bundle: true,
    minify: true,
    sourcemap: true,
    platform: 'browser',
    treeShaking: true,
    plugins: [], // No optimization plugin - include everything
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  },
  
  // Production browser bundle (full features with optimization)
  {
    name: 'browser-prod',
    entryPoints: ['src/index.ts'], // Use main index for browser
    outfile: 'dist/q5m.min.js',
    format: 'iife',
    globalName: 'Q5M',
    bundle: true,
    minify: true,
    sourcemap: false,
    platform: 'browser',
    external: [], // Keep complex.js bundled but optimized
    drop: ['console', 'debugger'],
    pure: ['console.log', 'console.info', 'console.debug', 'console.warn'],
    legalComments: 'none',
    treeShaking: true,
    plugins: [],
    mangleProps: /^_/,
    reserveProps: /^__/,
    ignoreAnnotations: false,
    keepNames: false,
    charset: 'utf8',
    mainFields: ['module', 'main'],
    minifyWhitespace: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    define: {
      'process.env.NODE_ENV': '"production"',
      'DEBUG': 'false',
      '__DEV__': 'false',
    },
  },

];

// Build all configurations
async function buildAll() {
  console.log('🔨 Building q5m.js bundles...\n');
  
  const results = [];
  
  for (const config of builds) {
    const startTime = Date.now();
    const name = config.name;
    console.log(`Building ${name}...`);
    
    try {
      // Remove 'name' from config before passing to esbuild
      const { name: _, ...buildConfig } = config;
      const result = await esbuild.build({
        ...buildConfig,
        metafile: true,
        logLevel: 'warning',
      });
      
      const size = fs.statSync(config.outfile).size;
      const sizeKB = (size / 1024).toFixed(2);
      const time = Date.now() - startTime;
      
      results.push({
        name: name,
        file: config.outfile,
        size: sizeKB,
        time,
      });
      
      console.log(`✅ ${name}: ${sizeKB} KB (${time}ms)`);
      
      // Save metafile for analysis
      if (result.metafile) {
        const metaPath = config.outfile.replace(/\.\w+$/, '.meta.json');
        fs.writeFileSync(metaPath, JSON.stringify(result.metafile));
      }
    } catch (error) {
      console.error(`❌ Failed to build ${name}:`, error.message);
    }
  }
  
  // Print summary
  console.log('\n📊 Build Summary:');
  console.log('─'.repeat(50));
  results.forEach(r => {
    console.log(`${r.name.padEnd(15)} ${r.size.padStart(10)} KB  ${r.time.toString().padStart(5)}ms`);
  });
  
  // Calculate total size
  const totalSize = results.reduce((sum, r) => sum + parseFloat(r.size), 0);
  console.log('─'.repeat(50));
  console.log(`Total:          ${totalSize.toFixed(2).padStart(10)} KB`);
}

// Analyze bundle
async function analyze(bundlePath) {
  const metaPath = bundlePath.replace(/\.\w+$/, '.meta.json');
  
  if (!fs.existsSync(metaPath)) {
    console.error(`Metafile not found: ${metaPath}`);
    console.log('Run build first to generate metafiles.');
    return;
  }
  
  const metafile = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const analysis = await esbuild.analyzeMetafile(metafile, {
    verbose: true,
  });
  
  console.log(analysis);
}

// CLI
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'analyze':
    analyze(args[0] || 'dist/index.mjs');
    break;
  default:
    buildAll().catch(console.error);
}