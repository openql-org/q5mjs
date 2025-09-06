// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import styles from '../styles/hadamard.module.css';

// Dynamic import for client-side only component
const HadamardTest = dynamic(() => import('../components/HadamardTest'), {
  ssr: false,
  loading: () => <div className={styles.loading}>Initializing quantum phase estimation...</div>
});

export default function HadamardTestPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <Head>
        <title>Hadamard Test Demo - Next.js</title>
        <meta name="description" content="Interactive Hadamard test demonstration for quantum phase estimation using Next.js and Q5M.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="keywords" content="quantum computing, hadamard test, phase estimation, next.js, q5m.js" />
      </Head>

      <main className={styles.main}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1>🧪 Hadamard Test with Next.js</h1>
            <p>Explore quantum phase estimation and phase kickback phenomena</p>
            <div className={styles.framework}>
              <span>Framework: Next.js</span>
              <span>Algorithm: Phase Estimation</span>
              <span>Technique: Phase Kickback</span>
            </div>
          </header>

          {isClient ? (
            <HadamardTest />
          ) : (
            <div className={styles.loading}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading quantum phase estimation environment...</p>
              <div className={styles.loadingSteps}>
                <div>→ Initializing quantum circuits</div>
                <div>→ Setting up controlled gates</div>
                <div>→ Preparing measurement systems</div>
              </div>
            </div>
          )}

          <footer className={styles.footer}>
            <p>Built with Next.js and Q5M.js • Quantum Algorithm Implementation</p>
          </footer>
        </div>
      </main>
    </>
  );
}
