'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, X, Check } from 'lucide-react';
import { useCartStore } from '@/store';
import { couponsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const discount = couponData?.discount || 0;
  const shippingFee = subtotal >= 2999 ? 0 : 99;
  const taxAmount = Math.round((subtotal - discount) * 0.18);
  const total = Math.max(0, subtotal - discount + shippingFee + taxAmount);

  const handleCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await couponsAPI.validate({ code: couponCode, orderAmount: subtotal });
      setCouponData(data);
      toast.success(`Coupon applied — ${fmt(data.discount)} saved!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon code');
      setCouponData(null);
    } finally { setCouponLoading(false); }
  };

  const removeCoupon = () => { setCouponData(null); setCouponCode(''); };

  if (items.length === 0) {
    return (
      <div className="pt-16 min-h-screen bg-velvet-cream flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <ShoppingBag size={56} className="text-velvet-beige mx-auto mb-5" />
            <h1 className="font-serif text-2xl font-light mb-2">Your cart is empty</h1>
            <p className="text-[0.85rem] text-velvet-muted mb-6 leading-relaxed">
              Looks like you haven't added anything to your cart yet. Start exploring our collection.
            </p>
            <Link href="/products" className="btn-primary inline-flex items-center gap-2">
              Browse Collection <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-velvet-cream">
      <div className="px-[5vw] py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="section-tag">✦ Shopping</p>
            <h1 className="font-serif text-3xl font-light">
              Your Cart <span className="text-lg text-velvet-muted font-sans font-normal">({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
            </h1>
          </div>
          <button onClick={() => { clearCart(); toast.success('Cart cleared'); }}
            className="text-[0.75rem] text-velvet-muted hover:text-red-500 transition-colors flex items-center gap-1">
            <Trash2 size={13} /> Clear cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Cart Items */}
          <div className="space-y-3">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.key}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border border-black/6 rounded p-4 md:p-5"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <Link href={`/products/${item.slug}`} className="flex-shrink-0">
                      <div className="w-20 h-24 md:w-24 md:h-28 bg-velvet-cream rounded overflow-hidden">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} width={96} height={112}
                            className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={24} className="text-velvet-muted" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[0.72rem] text-velvet-muted uppercase tracking-wide">{item.brand}</p>
                          <Link href={`/products/${item.slug}`} className="text-[0.88rem] font-medium text-velvet-black hover:text-gold transition-colors leading-snug">
                            {item.name}
                          </Link>
                          {(item.variant?.size || item.variant?.color) && (
                            <p className="text-[0.72rem] text-velvet-muted mt-0.5">
                              {[item.variant.size, item.variant.color].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>
                        <button onClick={() => removeItem(item.key)}
                          className="text-velvet-muted hover:text-red-500 transition-colors flex-shrink-0 p-1">
                          <X size={15} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                        {/* Quantity */}
                        <div className="flex items-center border border-black/12 rounded-sm">
                          <button onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            className="px-2.5 py-2 hover:bg-velvet-cream transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="px-3 py-2 text-[0.82rem] w-10 text-center border-x border-black/8">
                            {item.quantity}
                          </span>
                          <button onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            className="px-2.5 py-2 hover:bg-velvet-cream transition-colors">
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-serif text-lg">{fmt(item.price * item.quantity)}</p>
                          {item.price < item.originalPrice && (
                            <p className="text-[0.72rem] text-velvet-muted line-through">
                              {fmt(item.originalPrice * item.quantity)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Continue shopping */}
            <div className="pt-2">
              <Link href="/products" className="flex items-center gap-2 text-[0.78rem] text-velvet-muted hover:text-velvet-black transition-colors">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            {/* Coupon */}
            <div className="bg-white border border-black/6 rounded p-5">
              <h3 className="text-[0.78rem] font-medium uppercase tracking-wide mb-3 flex items-center gap-2">
                <Tag size={14} /> Apply Coupon
              </h3>
              {couponData ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-3">
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-green-600" />
                    <div>
                      <p className="text-[0.78rem] font-medium text-green-700">{couponData.coupon.code}</p>
                      <p className="text-[0.68rem] text-green-600">You save {fmt(couponData.discount)}</p>
                    </div>
                  </div>
                  <button onClick={removeCoupon} className="text-green-600 hover:text-green-800">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleCoupon()}
                    placeholder="Enter coupon code" className="input-luxury flex-1 uppercase" />
                  <button onClick={handleCoupon} disabled={couponLoading}
                    className="btn-outline !py-2.5 !px-4 whitespace-nowrap">
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {['VELVET10', 'WELCOME200', 'LUXURY20'].map((code) => (
                  <button key={code} onClick={() => setCouponCode(code)}
                    className="text-[0.65rem] border border-black/10 px-2 py-0.5 rounded-full text-velvet-muted hover:border-gold hover:text-gold transition-colors">
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-white border border-black/6 rounded p-5">
              <h3 className="font-serif text-lg font-light mb-4">Order Summary</h3>

              {/* Free shipping progress */}
              {subtotal < 2999 && (
                <div className="mb-4 p-3 bg-velvet-cream rounded">
                  <p className="text-[0.72rem] text-velvet-sub mb-1.5">
                    Add <strong className="text-velvet-black">{fmt(2999 - subtotal)}</strong> more for free shipping
                  </p>
                  <div className="h-1 bg-black/8 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }}
                      animate={{ width: `${Math.min((subtotal / 2999) * 100, 100)}%` }}
                      className="h-full bg-gold rounded-full" />
                  </div>
                </div>
              )}
              {subtotal >= 2999 && (
                <div className="mb-4 p-3 bg-green-50 rounded border border-green-100">
                  <p className="text-[0.75rem] text-green-700 font-medium">🎉 Free shipping unlocked!</p>
                </div>
              )}

              <div className="space-y-2.5">
                <div className="flex justify-between text-[0.82rem]">
                  <span className="text-velvet-muted">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[0.82rem]">
                    <span className="text-velvet-muted">Coupon Discount</span>
                    <span className="text-green-600 font-medium">−{fmt(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[0.82rem]">
                  <span className="text-velvet-muted">Shipping</span>
                  <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                    {shippingFee === 0 ? 'FREE' : fmt(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-[0.82rem]">
                  <span className="text-velvet-muted">GST (18%)</span>
                  <span>{fmt(taxAmount)}</span>
                </div>
                <div className="border-t border-black/6 pt-3 flex justify-between items-baseline">
                  <span className="font-medium">Total Amount</span>
                  <span className="font-serif text-2xl">{fmt(total)}</span>
                </div>
              </div>

              <Link href="/checkout" className="btn-primary flex items-center justify-center gap-2 w-full mt-5">
                Proceed to Checkout <ArrowRight size={15} />
              </Link>

              {/* Trust */}
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-[0.68rem] text-velvet-muted">
                <span>🔐 Secure Payment</span>
                <span>↩️ Easy Returns</span>
                <span>📦 Gift Packaging</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
