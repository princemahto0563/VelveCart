'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Star, Share2, ChevronDown, ChevronUp, Minus, Plus, Check } from 'lucide-react';
import { useCartStore, useWishlistStore } from '@/store';
import ProductCard from './ProductCard';
import ReviewSection from './ReviewSection';
import toast from 'react-hot-toast';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function ProductDetail({ product, related = [] }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const { addItem } = useCartStore();
  const { isInWishlist, toggle } = useWishlistStore();

  const inWishlist = isInWishlist(product._id);
  const displayPrice = product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price;
  const discountPct = Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100);

  // Group variants by type
  const sizes = [...new Set(product.variants?.filter((v) => v.size).map((v) => v.size))];
  const colors = [...new Set(product.variants?.filter((v) => v.color).map((v) => v.color))];
  const hasVariants = sizes.length > 0 || colors.length > 0;

  const handleMouseMove = useCallback((e) => {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, [zoomed]);

  const handleAddToCart = () => {
    if (hasVariants && !selectedVariant) {
      toast.error('Please select a variant');
      return;
    }
    addItem(product, selectedVariant || {}, quantity);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = '/checkout';
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  const handlePinterestShare = () => {
    const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&media=${encodeURIComponent(product.images?.[0]?.url)}&description=${encodeURIComponent(product.name)}`;
    window.open(url, '_blank', 'width=750,height=550');
  };

  const FAQS = [
    { q: 'What is your return policy?', a: 'We offer a 7-day hassle-free return policy. Items must be in original condition with tags attached.' },
    { q: 'How long does delivery take?', a: 'Standard delivery takes 3-5 business days. Express delivery (1-2 days) is available at checkout.' },
    { q: 'Is the product authentic?', a: 'Yes, all VelvetCart products are 100% authentic and quality-verified before shipping.' },
    { q: 'Do you offer gift wrapping?', a: 'Yes! All orders come in our premium VelvetCart packaging. Gift wrapping with a message is available at checkout.' },
  ];

  return (
    <div className="pt-16 min-h-screen">
      {/* Breadcrumb */}
      <div className="px-[5vw] py-4 flex items-center gap-2 text-[0.72rem] text-velvet-muted">
        <Link href="/" className="hover:text-velvet-black transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-velvet-black transition-colors">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category?.slug}`} className="hover:text-velvet-black transition-colors capitalize">
          {product.category?.name}
        </Link>
        <span>/</span>
        <span className="text-velvet-black truncate">{product.name}</span>
      </div>

      {/* Main Product Section */}
      <div className="px-[5vw] py-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

        {/* Image Gallery */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          <div className="hidden md:flex flex-col gap-2.5 w-[72px] flex-shrink-0">
            {product.images?.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative w-full aspect-square rounded overflow-hidden border-2 transition-all ${
                  i === selectedImage ? 'border-gold' : 'border-transparent hover:border-black/20'
                }`}
              >
                <Image src={img.url} alt={img.alt || product.name} fill className="object-cover" sizes="72px" />
              </button>
            ))}
          </div>

          {/* Main Image with zoom */}
          <div className="flex-1">
            <div
              className="relative rounded overflow-hidden cursor-crosshair select-none"
              style={{ aspectRatio: '3/4' }}
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {product.images?.[selectedImage] && (
                <>
                  <Image
                    src={product.images[selectedImage].url}
                    alt={product.images[selectedImage].alt || product.name}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 90vw, 45vw"
                  />
                  {/* Zoom overlay */}
                  {zoomed && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: `url(${product.images[selectedImage].url})`,
                        backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                        backgroundSize: '200%',
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                  )}
                </>
              )}

              {/* Flash badge */}
              {product.isFlashSale && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-[0.65rem] px-2.5 py-1 rounded-sm tracking-wider uppercase">
                  Flash Sale
                </div>
              )}
            </div>

            {/* Mobile thumbnails */}
            <div className="flex gap-2 mt-3 md:hidden overflow-x-auto no-scrollbar">
              {product.images?.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-14 h-16 relative rounded overflow-hidden border-2 transition-all ${i === selectedImage ? 'border-gold' : 'border-transparent'}`}>
                  <Image src={img.url} alt="" fill className="object-cover" sizes="56px" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:pt-2">
          <p className="text-[0.72rem] tracking-[0.14em] uppercase text-velvet-muted mb-2">{product.brand}</p>
          <h1 className="font-serif text-2xl md:text-3xl font-light leading-tight mb-3">{product.name}</h1>

          {/* Rating */}
          {product.rating?.count > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14}
                    className={i < Math.round(product.rating.average) ? 'text-gold fill-gold' : 'text-velvet-beige fill-velvet-beige'} />
                ))}
              </div>
              <span className="text-[0.78rem] text-velvet-muted">
                {product.rating.average} ({product.rating.count} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-1">
            <span className="font-serif text-3xl">{fmt(displayPrice)}</span>
            {discountPct > 0 && (
              <>
                <span className="text-velvet-muted line-through text-base">{fmt(product.originalPrice)}</span>
                <span className="text-[0.75rem] text-red-500 bg-red-50 px-2 py-0.5 rounded-sm">{discountPct}% off</span>
              </>
            )}
          </div>
          <p className="text-[0.72rem] text-velvet-muted mb-5">Inclusive of all taxes</p>

          {/* Variants */}
          {sizes.length > 0 && (
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2.5">
                <p className="text-[0.75rem] font-medium tracking-wide uppercase">Size</p>
                <button className="text-[0.72rem] text-gold underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const variant = product.variants?.find((v) => v.size === size);
                  const isSelected = selectedVariant?.size === size;
                  const outOfStock = variant?.stock === 0;
                  return (
                    <button
                      key={size}
                      disabled={outOfStock}
                      onClick={() => setSelectedVariant((prev) => ({ ...prev, size }))}
                      className={`px-4 py-2 text-[0.78rem] border rounded-sm transition-all ${
                        isSelected ? 'border-velvet-black bg-velvet-black text-white'
                        : outOfStock ? 'border-black/10 text-velvet-muted line-through cursor-not-allowed'
                        : 'border-black/15 hover:border-velvet-black'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div className="mb-5">
              <p className="text-[0.75rem] font-medium tracking-wide uppercase mb-2.5">
                Color: <span className="font-normal text-velvet-muted">{selectedVariant?.color || 'Select'}</span>
              </p>
              <div className="flex flex-wrap gap-2.5">
                {colors.map((color) => {
                  const variant = product.variants?.find((v) => v.color === color);
                  const isSelected = selectedVariant?.color === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedVariant((prev) => ({ ...prev, color, colorHex: variant?.colorHex }))}
                      title={color}
                      className={`w-8 h-8 rounded-full border-2 transition-all relative ${isSelected ? 'border-velvet-black scale-110' : 'border-black/15 hover:scale-105'}`}
                      style={{ background: variant?.colorHex || '#ccc' }}
                    >
                      {isSelected && <Check size={12} className="absolute inset-0 m-auto text-white drop-shadow" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <p className="text-[0.75rem] font-medium tracking-wide uppercase">Quantity</p>
            <div className="flex items-center border border-black/15 rounded-sm">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-velvet-cream transition-colors">
                <Minus size={14} />
              </button>
              <span className="px-4 py-2 text-sm w-12 text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-2 hover:bg-velvet-cream transition-colors">
                <Plus size={14} />
              </button>
            </div>
            <span className="text-[0.72rem] text-velvet-muted">
              {product.stock <= 10 && product.stock > 0 ? `Only ${product.stock} left!` : product.stock === 0 ? 'Out of stock' : 'In stock'}
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 mb-5">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <ShoppingBag size={16} /> Add to Cart
            </button>
            <button
              onClick={() => toggle(product)}
              className={`p-4 border rounded-sm transition-all ${inWishlist ? 'border-red-200 bg-red-50 text-red-500' : 'border-black/15 hover:border-gold hover:text-gold'}`}
            >
              <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="w-full btn-gold mb-6"
          >
            Buy Now
          </button>

          {/* Share */}
          <div className="flex items-center gap-3 pb-6 border-b border-black/6 mb-6">
            <span className="text-[0.72rem] text-velvet-muted uppercase tracking-wide">Share:</span>
            <button onClick={handleShare} className="p-2 border border-black/10 rounded-full hover:border-velvet-black transition-all" title="Share">
              <Share2 size={13} />
            </button>
            <button onClick={handlePinterestShare} className="p-2 border border-red-200 rounded-full hover:bg-red-50 transition-all text-red-500" title="Save to Pinterest">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
              </svg>
            </button>
          </div>

          {/* Delivery info */}
          <div className="space-y-2.5">
            {[
              { icon: '🚚', text: 'Free delivery on orders above ₹2,999' },
              { icon: '↩️', text: '7-day easy returns & exchanges' },
              { icon: '🔐', text: 'Secure payment — Razorpay, UPI, Cards' },
              { icon: '📦', text: 'Premium gift packaging included' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2.5 text-[0.78rem] text-velvet-sub">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, FAQ */}
      <div className="px-[5vw] py-12 border-t border-black/6">
        <div className="flex gap-6 border-b border-black/8 mb-8">
          {['description', 'specifications', 'faq'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[0.78rem] tracking-wide uppercase transition-all ${
                activeTab === tab ? 'border-b-2 border-velvet-black text-velvet-black font-medium' : 'text-velvet-muted hover:text-velvet-black'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {activeTab === 'description' && (
              <div className="prose prose-sm max-w-2xl text-velvet-sub leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description || '<p>No description available.</p>' }} />
            )}
            {activeTab === 'specifications' && (
              <div className="max-w-xl">
                {product.specifications?.length > 0 ? (
                  <table className="w-full">
                    <tbody>
                      {product.specifications.map((spec) => (
                        <tr key={spec.label} className="border-b border-black/5">
                          <td className="py-3 pr-6 text-[0.78rem] text-velvet-muted w-1/3">{spec.label}</td>
                          <td className="py-3 text-[0.82rem] text-velvet-black">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p className="text-sm text-velvet-muted">No specifications available.</p>}
              </div>
            )}
            {activeTab === 'faq' && (
              <div className="max-w-xl space-y-2">
                {FAQS.map((faq, i) => (
                  <div key={i} className="border border-black/8 rounded-sm overflow-hidden">
                    <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left text-[0.82rem] font-medium hover:bg-velvet-cream transition-colors">
                      {faq.q}
                      {expandedFaq === i ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                    <AnimatePresence>
                      {expandedFaq === i && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <p className="px-5 pb-4 text-[0.8rem] text-velvet-sub leading-relaxed">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Reviews */}
      <ReviewSection productId={product._id} />

      {/* Related Products */}
      {related.length > 0 && (
        <div className="px-[5vw] py-12 border-t border-black/6">
          <div className="mb-8">
            <p className="section-tag">✦ You May Also Like</p>
            <h2 className="section-title">Related Products</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {related.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}
