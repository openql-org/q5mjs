#!/bin/bash
## SPDX-License-Identifier: MIT
## SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

# q5m.js Examples Runner (Shell Script)
# Run quantum computing examples for Linux/macOS

set -e

echo "============================================================"
echo "q5m.js Examples Runner"
echo "============================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js to run the examples"
    exit 1
fi

# Check if tsx is available
if ! npx tsx --version &> /dev/null; then
    echo "Installing tsx..."
    npm install -g tsx
fi

# Run the TypeScript examples
echo "Running examples..."
npx tsx examples/run.ts

echo ""
echo "============================================================"
echo "Examples completed successfully!"
echo "============================================================"
