'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('VelvetCart Error:', error);
  }, [error]);

  return (
    <div className="pt-16 min-h-screen bg-velvet-cream flex items-center justify-center px-5">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-4">⚡</p>
        <p className="section-tag">✦ Something went wrong</p>
        <h1 className="font-serif text-2xl font-light mb-3">An error occurred</h1>
        <p className="text-[0.85rem] text-velvet-muted mb-8">
          Don't worry — your cart is safe. Please try again or contact support if the issue persists.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-primary">Try Again</button>
          <Link href="/" className="btn-outline">Go Home</Link>
        </div>
      </div>
    </div>
  );
}
