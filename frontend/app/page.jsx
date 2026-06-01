import { Suspense } from 'react';
import HeroSection from '@/components/home/HeroSection';
import MarqueeBar from '@/components/home/MarqueeBar';
import TrustBar from '@/components/home/TrustBar';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import CategoriesGrid from '@/components/home/CategoriesGrid';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import NewsletterSection from '@/components/home/NewsletterSection';
import { productsAPI, categoriesAPI } from '@/lib/api';

async function getHomepageData() {
  try {
    const [featuredRes, flashRes, categoriesRes] = await Promise.allSettled([
      productsAPI.getFeatured(),
      productsAPI.getFlashSale(),
      categoriesAPI.getAll(),
    ]);

    return {
      featured: featuredRes.status === 'fulfilled' ? featuredRes.value.data.products : [],
      flash: flashRes.status === 'fulfilled' ? flashRes.value.data.products : [],
      categories: categoriesRes.status === 'fulfilled' ? categoriesRes.value.data.categories : [],
    };
  } catch {
    return { featured: [], flash: [], categories: [] };
  }
}

export const revalidate = 300; // ISR: revalidate every 5 minutes

export default async function HomePage() {
  const { featured, flash, categories } = await getHomepageData();

  return (
    <>
      <HeroSection />
      <MarqueeBar />
      <TrustBar />
      <Suspense fallback={<div className="h-96 bg-velvet-cream animate-pulse" />}>
        <CategoriesGrid categories={categories} />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <FeaturedProducts products={featured} />
      </Suspense>
      {flash.length > 0 && (
        <Suspense fallback={<div className="h-80 bg-velvet-black" />}>
          <FlashSaleSection products={flash} />
        </Suspense>
      )}
      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
}
