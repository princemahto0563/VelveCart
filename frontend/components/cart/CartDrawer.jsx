'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCartStore();

  const shippingFee = subtotal >= 2999 ? 0 : 99;
  const total = subtotal + shippingFee;

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/50 z-[80] backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-white z-[90] flex flex-col shadow-luxury-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/6">
              <div>
                <h2 className="font-serif text-xl font-light">Your Cart</h2>
                <p className="text-[0.72rem] text-velvet-muted mt-0.5">
                  {items.length === 0 ? 'Empty' : `${items.reduce((s, i) => s + i.quantity, 0)} item${items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}`}
                </p>
              </div>
              <button
                onClick={closeCart}
                className="p-2 border border-black/10 rounded-full hover:bg-velvet-black hover:text-white hover:border-velvet-black transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Free shipping progress */}
            {subtotal < 2999 && subtotal > 0 && (
              <div className="px-6 py-3 bg-velvet-cream border-b border-black/5">
                <div className="flex justify-between mb-1.5">
                  <span className="text-[0.7rem] text-velvet-sub">Add {fmt(2999 - subtotal)} more for free shipping</span>
                  <span className="text-[0.7rem] text-gold font-medium">{Math.round((subtotal / 2999) * 100)}%</span>
                </div>
                <div className="h-1 bg-black/8 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((subtotal / 2999) * 100, 100)}%` }}
                    className="h-full bg-gold rounded-full"
                  />
                </div>
              </div>
            )}
            {subtotal >= 2999 && (
              <div className="px-6 py-2.5 bg-green-50 border-b border-green-100 text-[0.72rem] text-green-700 font-medium">
                🎉 You've unlocked free shipping!
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
                  <ShoppingBag size={40} className="text-velvet-beige" />
                  <div>
                    <p className="font-serif text-lg text-velvet-black">Your cart is empty</p>
                    <p className="text-sm text-velvet-muted mt-1">Add something beautiful</p>
                  </div>
                  <button onClick={closeCart} className="btn-primary mt-4">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.key}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-4"
                  >
                    {/* Image */}
                    <Link href={`/products/${item.slug}`} onClick={closeCart} className="flex-shrink-0">
                      <div className="w-20 h-24 bg-velvet-cream rounded overflow-hidden">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} width={80} height={96} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-velvet-muted">
                            <ShoppingBag size={24} />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.slug}`} onClick={closeCart}>
                        <p className="text-[0.82rem] font-medium text-velvet-black leading-tight hover:text-gold transition-colors truncate">
                          {item.name}
                        </p>
                      </Link>
                      <p className="text-[0.7rem] text-velvet-muted mt-0.5">{item.brand}</p>
                      {(item.variant?.size || item.variant?.color) && (
                        <p className="text-[0.68rem] text-velvet-muted mt-0.5">
                          {[item.variant.size, item.variant.color].filter(Boolean).join(' · ')}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2.5">
                        {/* Qty controls */}
                        <div className="flex items-center gap-2 border border-black/10 rounded-sm">
                          <button
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            className="p-1.5 hover:bg-velvet-cream transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-[0.8rem] w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            className="p-1.5 hover:bg-velvet-cream transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-serif text-base text-velvet-black">
                            {fmt(item.price * item.quantity)}
                          </p>
                          {item.price < item.originalPrice && (
                            <p className="text-[0.68rem] text-velvet-muted line-through">
                              {fmt(item.originalPrice * item.quantity)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.key)}
                      className="flex-shrink-0 self-start p-1 text-velvet-muted hover:text-red-500 transition-colors mt-0.5"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-black/6 px-6 py-5 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-velvet-muted">Subtotal</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-velvet-muted">Shipping</span>
                    <span className={shippingFee === 0 ? 'text-green-600' : ''}>
                      {shippingFee === 0 ? 'FREE' : fmt(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium border-t border-black/6 pt-2">
                    <span className="text-sm">Total (excl. GST)</span>
                    <span className="font-serif text-lg">{fmt(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="btn-primary flex items-center justify-center gap-2 w-full"
                >
                  Checkout <ArrowRight size={15} />
                </Link>

                <button
                  onClick={closeCart}
                  className="w-full text-center text-[0.75rem] text-velvet-muted hover:text-velvet-black transition-colors py-1 tracking-wide"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
