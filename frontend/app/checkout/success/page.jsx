'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { ordersAPI } from '@/lib/api';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const method = searchParams.get('method');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderId) {
      ordersAPI.getOne(orderId)
        .then(({ data }) => setOrder(data.order))
        .catch(() => {});
    }
  }, [orderId]);

  const isQR = method === 'qr';
  const isCOD = method === 'cod';

  return (
    <div className="pt-20 min-h-screen bg-velvet-cream flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded border border-black/6 p-8 md:p-12 max-w-lg w-full text-center shadow-luxury"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={40} className="text-green-500" />
        </motion.div>

        <p className="text-[0.7rem] tracking-[0.2em] uppercase text-gold mb-2">✦ Order Placed</p>
        <h1 className="font-serif text-3xl font-light mb-3">
          {isQR ? 'Payment Under Review' : 'Thank You!'}
        </h1>

        {isQR ? (
          <p className="text-[0.85rem] text-velvet-muted leading-relaxed mb-6">
            Your payment screenshot has been received. Our team will verify and confirm your order within <strong className="text-velvet-black">2–4 hours</strong>. You'll receive an email once verified.
          </p>
        ) : isCOD ? (
          <p className="text-[0.85rem] text-velvet-muted leading-relaxed mb-6">
            Your order has been placed successfully! Please keep the exact amount ready at the time of delivery. You'll receive a confirmation email shortly.
          </p>
        ) : (
          <p className="text-[0.85rem] text-velvet-muted leading-relaxed mb-6">
            Your payment was successful and your order is confirmed! We're preparing your luxury package with care.
          </p>
        )}

        {order && (
          <div className="bg-velvet-cream rounded p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-[0.82rem]">
              <span className="text-velvet-muted">Order ID</span>
              <span className="font-medium">#{order.orderId}</span>
            </div>
            <div className="flex justify-between text-[0.82rem]">
              <span className="text-velvet-muted">Total</span>
              <span className="font-serif">₹{Number(order.totalPrice).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[0.82rem]">
              <span className="text-velvet-muted">Payment</span>
              <span className="capitalize">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-[0.82rem]">
              <span className="text-velvet-muted">Status</span>
              <span className={`${isQR ? 'badge-pending' : 'badge-delivered'}`}>
                {isQR ? 'Pending Verification' : isCOD ? 'Confirmed' : 'Paid & Confirmed'}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link href="/account/orders" className="btn-primary flex items-center justify-center gap-2">
            <Package size={16} /> Track My Order
          </Link>
          <Link href="/products" className="btn-outline flex items-center justify-center gap-2">
            Continue Shopping <ArrowRight size={15} />
          </Link>
        </div>

        <p className="text-[0.7rem] text-velvet-muted mt-6">
          A confirmation email has been sent to your registered email address.
        </p>
      </motion.div>
    </div>
  );
}
