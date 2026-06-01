import { Suspense } from 'react';
import ProductsClient from './ProductsClient';

export const metadata = {
  title: 'Shop All Products',
  description: 'Discover our curated luxury collection — jewellery, fashion, beauty and home decor.',
};

export default function ProductsPage() {
  return (
    <div className="pt-16 min-h-screen">
      <Suspense fallback={<div className="min-h-screen bg-velvet-cream flex items-center justify-center"><div className="skeleton w-full h-64 max-w-lg rounded" /></div>}>
        <ProductsClient />
      </Suspense>
    </div>
  );
}
