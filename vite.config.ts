// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath, URL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: 'examples',
  publicDir: path.resolve(__dirname, 'dist'),
  resolve: {
    alias: {
      'q5mjs': path.resolve(__dirname, 'src/index.ts'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'q5m',
      fileName: 'q5m',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true,
  },
});
