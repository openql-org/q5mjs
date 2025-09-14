// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import styles from '../styles/entanglement.module.css';

// Dynamic import for client-side only component
const EntanglementDemo = dynamic(() => import('../components/EntanglementDemo'), {
  ssr: false,
  loading: () => <div className={styles.loading}>Loading quantum simulation...</div>
});

export default function EntanglementPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <Head>
        <title>Quantum Entanglement Demo - Next.js</title>
        <meta name="description" content="Interactive quantum entanglement demonstration with Bell states and GHZ states using Next.js and Q5M.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1>🔗 Quantum Entanglement with Next.js</h1>
            <p>Explore Bell states and GHZ states using Q5M.js in a Next.js application</p>
            <div className={styles.framework}>
              <span>Framework: Next.js</span>
              <span>SSR: Compatible</span>
              <span>Dynamic Import: Client-side quantum library</span>
            </div>
          </header>

          {isClient ? (
            <EntanglementDemo />
          ) : (
            <div className={styles.loading}>
              <div className={styles.loadingSpinner}></div>
              <p>Initializing quantum computing environment...</p>
            </div>
          )}

          <footer className={styles.footer}>
            <p>Built with Next.js and Q5M.js • Server-Side Rendering Compatible</p>
          </footer>
        </div>
      </main>
    </>
  );
}
