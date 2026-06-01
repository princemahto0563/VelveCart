import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="pt-16 min-h-screen bg-velvet-cream flex items-center justify-center px-5">
      <div className="text-center max-w-sm">
        <p className="font-serif text-[8rem] font-light text-black/8 leading-none mb-4">404</p>
        <p className="section-tag">✦ Page Not Found</p>
        <h1 className="font-serif text-2xl font-light mb-3">This page doesn't exist</h1>
        <p className="text-[0.85rem] text-velvet-muted mb-8 leading-relaxed">
          The page you're looking for may have been moved or doesn't exist. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">Back to Home</Link>
          <Link href="/products" className="btn-outline">Browse Products</Link>
        </div>
      </div>
    </div>
  );
}
