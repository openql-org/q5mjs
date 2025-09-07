#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up E2E test environment...');

// 1. Check if dist directory exists
const distPath = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distPath)) {
  console.log('📦 Building project first...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// 2. Verify dist folder exists (no copying needed)
console.log('📁 Verifying dist folder exists...');

if (!fs.existsSync(distPath)) {
  console.error('❌ Dist folder not found. Please run npm run build first.');
  process.exit(1);
}

console.log('✅ Dist folder verified');

// 3. Verify critical files exist
const criticalFiles = [
  'dist/q5m.umd.js',
  'cypress/fixtures/pages/minimal.html'
];

console.log('🔍 Verifying test files...');
let allFilesExist = true;

for (const file of criticalFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.error('❌ Some critical files are missing. E2E tests may fail.');
  process.exit(1);
}

// 4. Check UMD file size and contents
const umdPath = path.join(__dirname, '..', 'dist', 'q5m.umd.js');
const stats = fs.statSync(umdPath);
const fileSizeKB = Math.round(stats.size / 1024);

console.log(`📊 UMD file size: ${fileSizeKB}KB`);

// Quick check that UMD file contains expected exports
const umdContent = fs.readFileSync(umdPath, 'utf8');
const expectedExports = ['Circuit', 'Complex', 'grover', 'QFT'];
const missingExports = expectedExports.filter(exp => !umdContent.includes(exp));

if (missingExports.length > 0) {
  console.warn(`⚠️ UMD file may be missing exports: ${missingExports.join(', ')}`);
} else {
  console.log('✅ UMD file contains expected exports');
}

// 5. Test framework configurations
console.log('🔧 Testing framework configurations...');

const frameworks = ['none', 'vanilla', 'react', 'vue', 'angular', 'nextjs', 'nuxtjs', 'frameworks', 'all'];
for (const framework of frameworks) {
  console.log(`  📋 Framework: ${framework}`);
}

console.log('🎉 E2E test environment setup complete!');
console.log('');
console.log('Available test commands:');
console.log('  npm run test:e2e           # Core tests (serverless)');
console.log('  npm run test:e2e:vanilla   # Vanilla JS framework');
console.log('  npm run test:e2e:react     # React framework');
console.log('  npm run test:e2e:vue       # Vue framework');  
console.log('  npm run test:e2e:angular   # Angular framework');
console.log('  npm run test:e2e:nextjs    # Next.js framework');
console.log('  npm run test:e2e:nuxtjs    # Nuxt.js framework');
console.log('  npm run test:e2e:frameworks # All framework tests');
console.log('  npm run test:e2e:all       # All tests (core + frameworks)');
console.log('');
