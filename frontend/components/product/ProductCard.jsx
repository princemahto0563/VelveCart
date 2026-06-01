'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCartStore, useWishlistStore } from '@/store';
import clsx from 'clsx';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function ProductCard({ product, index = 0, variant = 'default' }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const { addItem } = useCartStore();
  const { isInWishlist, toggle } = useWishlistStore();

  if (!product) return null;

  const inWishlist = isInWishlist(product._id);
  const discountPct = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const displayPrice = product.isFlashSale && product.flashSalePrice
    ? product.flashSalePrice : product.price;
  const imageUrl = product.images?.[0]?.url;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, {}, 1);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product);
  };

  if (variant === 'horizontal') {
    return (
      <Link href={`/products/${product.slug}`} className="flex gap-4 group">
        <div className="w-20 h-24 bg-velvet-cream rounded overflow-hidden flex-shrink-0">
          {imageUrl && (
            <Image src={imageUrl} alt={product.name} width={80} height={96}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-[0.78rem] text-velvet-muted uppercase tracking-wide">{product.brand}</p>
          <p className="text-[0.85rem] font-medium text-velvet-black mt-0.5 group-hover:text-gold transition-colors leading-tight">{product.name}</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="font-serif text-base">{fmt(displayPrice)}</span>
            {discountPct > 0 && (
              <span className="text-[0.68rem] text-velvet-muted line-through">{fmt(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/products/${product.slug}`} className="product-card group block">
        {/* Image */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
          {/* Skeleton */}
          {!imgLoaded && <div className="absolute inset-0 skeleton" />}

          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={clsx(
                'object-cover transition-all duration-500 group-hover:scale-105',
                imgLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImgLoaded(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-velvet-cream flex items-center justify-center">
              <ShoppingBag size={32} className="text-velvet-beige" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isFlashSale && (
              <span className="bg-red-500 text-white text-[0.6rem] px-2 py-0.5 tracking-wider uppercase rounded-sm">
                Flash Sale
              </span>
            )}
            {discountPct >= 30 && !product.isFlashSale && (
              <span className="bg-velvet-black text-white text-[0.6rem] px-2 py-0.5 tracking-wider uppercase rounded-sm">
                {discountPct}% Off
              </span>
            )}
            {product.stock <= 5 && product.stock > 0 && (
              <span className="bg-amber-500 text-white text-[0.6rem] px-2 py-0.5 tracking-wider uppercase rounded-sm">
                Only {product.stock} left
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-velvet-muted text-white text-[0.6rem] px-2 py-0.5 tracking-wider uppercase rounded-sm">
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={clsx(
              'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center',
              'bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200',
              'hover:bg-white hover:scale-110',
              inWishlist ? 'text-red-500' : 'text-velvet-sub'
            )}
          >
            <Heart size={14} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>

          {/* Quick Add */}
          <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={clsx(
                'w-full py-2.5 text-[0.72rem] tracking-luxury uppercase font-medium transition-all',
                'flex items-center justify-center gap-2 rounded-sm',
                product.stock === 0
                  ? 'bg-velvet-muted/80 text-white cursor-not-allowed'
                  : 'bg-white/95 text-velvet-black hover:bg-gold hover:text-white'
              )}
            >
              <ShoppingBag size={13} />
              {product.stock === 0 ? 'Sold Out' : 'Quick Add'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5">
          {product.rating?.count > 0 && (
            <div className="flex items-center gap-1 mb-1.5">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    className={i < Math.round(product.rating.average) ? 'text-gold fill-gold' : 'text-velvet-beige fill-velvet-beige'}
                  />
                ))}
              </div>
              <span className="text-[0.65rem] text-velvet-muted">({product.rating.count})</span>
            </div>
          )}

          <p className="text-[0.68rem] text-velvet-muted uppercase tracking-wide mb-0.5">{product.brand}</p>
          <p className="text-[0.85rem] text-velvet-black font-medium leading-snug mb-2 line-clamp-2">
            {product.name}
          </p>

          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-serif text-base font-medium">{fmt(displayPrice)}</span>
            {discountPct > 0 && (
              <>
                <span className="text-[0.75rem] text-velvet-muted line-through">{fmt(product.originalPrice)}</span>
                <span className="text-[0.68rem] text-red-500 bg-red-50 px-1.5 py-0.5 rounded-sm">{discountPct}% off</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
