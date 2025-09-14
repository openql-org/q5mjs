// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import styles from '../styles/interference.module.css';

// Dynamic import for client-side only component
const InterferenceVisualization = dynamic(() => import('../components/InterferenceVisualization'), {
  ssr: false,
  loading: () => <div className={styles.loading}>Initializing quantum interference simulation...</div>
});

export default function InterferenceVisualizationPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <Head>
        <title>Quantum Interference Visualization - Next.js</title>
        <meta name="description" content="Interactive quantum interference visualization with wave-particle duality demonstrations using Next.js and Q5M.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="keywords" content="quantum interference, wave-particle duality, superposition, next.js, q5m.js, quantum visualization" />
        <meta property="og:title" content="Quantum Interference Visualization" />
        <meta property="og:description" content="Explore quantum superposition and interference patterns" />
        <meta property="og:type" content="website" />
      </Head>

      <main className={styles.main}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1>🌊 Quantum Interference Visualization</h1>
            <p>Explore wave-particle duality and quantum superposition with interactive animations</p>
            <div className={styles.framework}>
              <span>Framework: Next.js</span>
              <span>Canvas: HTML5 + WebGL</span>
              <span>Physics: Wave Interference</span>
              <span>Animation: 60fps Real-time</span>
            </div>
          </header>

          {isClient ? (
            <InterferenceVisualization />
          ) : (
            <div className={styles.loading}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading quantum wave interference engine...</p>
              <div className={styles.loadingSteps}>
                <div>→ Initializing canvas renderer</div>
                <div>→ Setting up wave equations</div>
                <div>→ Preparing interference patterns</div>
                <div>→ Loading quantum experiments</div>
              </div>
            </div>
          )}

          <footer className={styles.footer}>
            <p>Built with Next.js and Q5M.js • Real-time Quantum Wave Simulation</p>
            <div className={styles.footerLinks}>
              <span>Wave-Particle Duality</span>
              <span>Quantum Superposition</span>
              <span>Interference Patterns</span>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
