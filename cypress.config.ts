// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { defineConfig } from 'cypress';

/**
 * Get framework-specific configuration
 */
function getFrameworkConfig(framework: string | undefined) {
  const configs = {
    'none': {
      specPattern: 'cypress/e2e/core/**/*.cy.ts',
      displayName: 'Core API Tests (Serverless)'
    },
    'vanilla': {
      specPattern: 'cypress/e2e/frameworks/vanilla.cy.ts',
      displayName: 'Vanilla JavaScript (Serverless)'
    },
    'react': {
      specPattern: 'cypress/e2e/frameworks/react.cy.ts',
      displayName: 'React Framework (Serverless)'
    },
    'vue': {
      specPattern: 'cypress/e2e/frameworks/vue.cy.ts',
      displayName: 'Vue Framework (Serverless)'
    },
    'angular': {
      specPattern: 'cypress/e2e/frameworks/angular.cy.ts',
      displayName: 'Angular Framework (Serverless)'
    },
    'nextjs': {
      specPattern: 'cypress/e2e/frameworks/nextjs.cy.ts',
      displayName: 'Next.js Framework (Serverless)'
    },
    'nuxtjs': {
      specPattern: 'cypress/e2e/frameworks/nuxtjs.cy.ts',
      displayName: 'Nuxt.js Framework (Serverless)'
    },
    'frameworks': {
      specPattern: 'cypress/e2e/frameworks/**/*.cy.ts',
      displayName: 'All Framework Tests (Serverless)'
    },
    'all': {
      specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
      displayName: 'All Tests (Core + Frameworks)'
    }
  };
  
  return configs[framework as keyof typeof configs] || configs['none'];
}

export default defineConfig({
  e2e: {
    supportFile: 'cypress/support/e2e.ts',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    fixturesFolder: 'cypress/fixtures',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    // baseUrl: removed - using serverless approach with minimal.html
    
    env: {
      // Environment variables for tests
      apiUrl: 'http://localhost:3000/api',
    },

    setupNodeEvents(on, config) {
      // Get framework from environment
      const framework = config.env.framework || 'none';
      const frameworkConfig = getFrameworkConfig(framework);
      
      // Update spec pattern based on framework
      config.specPattern = frameworkConfig.specPattern;
      
      console.log(`🔧 Cypress configured for: ${frameworkConfig.displayName}`);
      console.log(`📁 Spec pattern: ${Array.isArray(frameworkConfig.specPattern) ? frameworkConfig.specPattern.join(', ') : frameworkConfig.specPattern}`);
      
      // Node event listeners
      on('task', {
        // Custom tasks for quantum calculations
        log(message) {
          console.log(message);
          return null;
        },
        
        // Task to verify quantum circuit results
        verifyQuantumResult({ expected, actual, tolerance = 1e-10 }) {
          const difference = Math.abs(expected - actual);
          return difference < tolerance;
        },
        
        // Task to check available frameworks
        checkAvailableFrameworks() {
          const available = ['none']; // Always available
          
          // Check for React dependencies
          try {
            require.resolve('react');
            available.push('react');
          } catch {}
          
          // Check for Vue dependencies
          try {
            require.resolve('vue');
            available.push('vue');
          } catch {}
          
          // Check for Angular dependencies
          try {
            require.resolve('@angular/core');
            available.push('angular');
          } catch {}
          
          if (available.length > 1) {
            available.push('all');
          }
          
          return available;
        },
        
        // Task to get framework info
        getFrameworkInfo(framework) {
          return getFrameworkConfig(framework);
        }
      });

      return config;
    },
  },


  // Global settings
  retries: {
    runMode: 2,
    openMode: 0,
  },
  
  watchForFileChanges: true,
  numTestsKeptInMemory: 50,
  
  // Security settings
  chromeWebSecurity: false,
  modifyObstructiveCode: false,
});