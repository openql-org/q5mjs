# Next.js Entanglement Example

Interactive demonstration of quantum entanglement using Next.js with SSR compatibility and Q5M.js.

## Features

- **Next.js 14**: Latest features including App Router compatibility
- **SSR Compatible**: Proper server-side rendering with client-side quantum library loading
- **Dynamic Imports**: Q5M.js loaded only on client-side to avoid SSR issues
- **CSS Modules**: Scoped styling with modern CSS features
- **Performance Optimized**: Bundle splitting and lazy loading
- **TypeScript Ready**: Easily convertible to TypeScript

## Architecture

### SSR Compatibility
```javascript
// Dynamic import prevents SSR issues
const EntanglementDemo = dynamic(() => import('../components/EntanglementDemo'), {
  ssr: false,
  loading: () => <div>Loading quantum simulation...</div>
});
```

### Client-Side Library Loading
```javascript
// Browser-only quantum library import
let Q5M;
if (typeof window !== 'undefined') {
  import('../../../../dist/q5m.min.js').then((module) => {
    Q5M = window.Q5M;
  });
}
```

### State Management
```javascript
const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
const [quantumState, setQuantumState] = useState(null);
const [currentState, setCurrentState] = useState('reset');
```

## Files Structure

```
01-entanglement/
├── pages/
│   └── index.js              # Main page with SSR setup
├── components/
│   └── EntanglementDemo.js   # Client-side quantum component
├── styles/
│   └── entanglement.module.css # CSS Modules styling
├── next.config.js            # Next.js configuration
├── package.json              # Dependencies and scripts
└── README.md                 # This documentation
```

## Installation

```bash
# Navigate to the example directory
cd examples/browser/frameworks/nextjs/01-entanglement

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## Next.js Specific Features

### Dynamic Imports
- **Purpose**: Prevent server-side execution of browser-only code
- **Implementation**: `dynamic()` function with `ssr: false`
- **Benefits**: Avoids hydration mismatches and SSR errors

### CSS Modules
- **Scoped Styles**: Automatically scoped class names
- **Performance**: Built-in optimization and purging
- **Maintainability**: Component-specific styling

### Head Management
```javascript
import Head from 'next/head';

<Head>
  <title>Quantum Entanglement Demo - Next.js</title>
  <meta name="description" content="Interactive quantum entanglement demonstration" />
</Head>
```

### Performance Optimizations
- **Bundle Splitting**: Automatic code splitting
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Automatic font loading optimization
- **Bundle Analysis**: Built-in bundle analyzer support

## Quantum States Demonstrated

### Bell States
- **|Φ⁺⟩**: (|00⟩ + |11⟩)/√2 - Maximum entanglement
- **|Φ⁻⟩**: (|00⟩ - |11⟩)/√2 - Phase-flipped Bell state

### Multi-qubit States
- **GHZ State**: (|000⟩ + |111⟩)/√2 - 3-qubit entanglement
- **W State**: (|001⟩ + |010⟩ + |100⟩)/√3 - Symmetric entanglement

## Development Workflow

### Development Server
```bash
npm run dev
```
- Hot reloading enabled
- Fast refresh for React components
- Automatic error overlay

### Production Build
```bash
npm run build
npm start
```
- Optimized bundles
- Static generation where possible
- Performance optimizations applied

### Code Quality
```bash
npm run lint
```
- ESLint with Next.js configuration
- Automatic code formatting suggestions
- Import optimization

## SSR Considerations

### Client-Side Only Components
- Quantum library requires browser environment
- Dynamic imports prevent SSR execution
- Loading states provide smooth UX

### Hydration Strategy
```javascript
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
}, []);
```

### Error Boundaries
- Graceful handling of quantum library loading errors
- Fallback UI for SSR/client mismatch
- Progressive enhancement approach

## Performance Features

### Bundle Optimization
- Tree shaking for minimal bundle size
- Dynamic imports for code splitting
- Webpack optimizations in next.config.js

### Runtime Performance
- React 18 concurrent features
- Automatic static optimization
- Image and font optimization

## Browser Compatibility

- **Modern Browsers**: Full feature support
- **Legacy Support**: Graceful degradation
- **Mobile Responsive**: Touch-friendly controls
- **Accessibility**: WCAG 2.1 compliance

## Integration Examples

### In Next.js App Router
```javascript
// app/quantum/page.js
import EntanglementDemo from './components/EntanglementDemo';

export default function QuantumPage() {
  return <EntanglementDemo />;
}
```

### As Reusable Component
```javascript
// components/QuantumSection.js
import dynamic from 'next/dynamic';

const EntanglementDemo = dynamic(() => import('./EntanglementDemo'), {
  ssr: false
});

export default function QuantumSection() {
  return (
    <section>
      <h2>Quantum Computing Demo</h2>
      <EntanglementDemo />
    </section>
  );
}
```

## Educational Value

### Next.js Concepts
- Server-side rendering with client-side interactivity
- Dynamic imports and code splitting
- CSS Modules and styling strategies
- Performance optimization techniques
- Modern React patterns in Next.js

### Quantum Physics
- Quantum entanglement visualization
- Bell state properties and creation
- Multi-qubit entangled states
- Measurement probability interpretation
- Complex amplitude representation

Perfect for learning modern Next.js development while exploring quantum computing concepts with proper SSR handling.