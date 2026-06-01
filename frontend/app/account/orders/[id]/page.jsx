'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, MapPin, CreditCard, Truck, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { ordersAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:    { icon: Clock,        color: 'text-amber-400',  bg: 'bg-amber-500/10',  label: 'Pending' },
  confirmed:  { icon: CheckCircle,  color: 'text-blue-400',   bg: 'bg-blue-500/10',   label: 'Confirmed' },
  processing: { icon: Package,      color: 'text-gold',       bg: 'bg-gold/10',       label: 'Processing' },
  shipped:    { icon: Truck,        color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Shipped' },
  delivered:  { icon: CheckCircle,  color: 'text-green-400',  bg: 'bg-green-500/10',  label: 'Delivered' },
  cancelled:  { icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-500/10',    label: 'Cancelled' },
  refunded:   { icon: AlertTriangle,color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Refunded' },
};

const STEPS = ['confirmed', 'processing', 'shipped', 'delivered'];

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { router.push('/login'); return; }
    ordersAPI.getOne(id)
      .then(({ data }) => setOrder(data.order))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  }, [id, isLoggedIn]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await ordersAPI.cancel(id, { reason: 'Customer request' });
      setOrder(data.order);
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel this order');
    } finally { setCancelling(false); }
  };

  if (loading) return (
    <div className="pt-16 min-h-screen bg-velvet-cream flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-velvet-muted">Loading order...</p>
      </div>
    </div>
  );

  if (!order) return (
    <div className="pt-16 min-h-screen bg-velvet-cream flex items-center justify-center text-center">
      <div>
        <Package size={40} className="text-velvet-beige mx-auto mb-4" />
        <p className="font-serif text-lg text-velvet-muted">Order not found</p>
        <Link href="/account/orders" className="btn-outline mt-4 inline-block">Back to Orders</Link>
      </div>
    </div>
  );

  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;
  const currentStep = STEPS.indexOf(order.status);
  const canCancel = !['delivered', 'shipped', 'cancelled', 'refunded'].includes(order.status);

  return (
    <div className="pt-16 min-h-screen bg-velvet-cream">
      <div className="px-[5vw] py-8 max-w-4xl mx-auto">
        {/* Back */}
        <Link href="/account" className="flex items-center gap-2 text-[0.78rem] text-velvet-muted hover:text-velvet-black mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Account
        </Link>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="section-tag">✦ Order</p>
            <h1 className="font-serif text-2xl font-light">#{order.orderId}</h1>
            <p className="text-[0.75rem] text-velvet-muted mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded ${statusCfg.bg}`}>
            <StatusIcon size={16} className={statusCfg.color} />
            <span className={`text-[0.82rem] font-medium ${statusCfg.color}`}>{statusCfg.label}</span>
          </div>
        </div>

        {/* Progress Tracker */}
        {!['cancelled', 'refunded'].includes(order.status) && (
          <div className="bg-white border border-black/6 rounded p-5 mb-5">
            <h3 className="text-[0.75rem] font-medium uppercase tracking-wide mb-4">Order Progress</h3>
            <div className="flex items-center">
              {STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      i <= currentStep ? 'border-gold bg-gold' : 'border-black/15 bg-white'
                    }`}>
                      {i <= currentStep
                        ? <CheckCircle size={16} className="text-white" />
                        : <div className="w-2 h-2 rounded-full bg-black/15" />
                      }
                    </div>
                    <span className={`text-[0.65rem] mt-1.5 capitalize tracking-wide ${i <= currentStep ? 'text-velvet-black font-medium' : 'text-velvet-muted'}`}>
                      {step}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 transition-all ${i < currentStep ? 'bg-gold' : 'bg-black/10'}`} />
                  )}
                </div>
              ))}
            </div>
            {order.trackingNumber && (
              <div className="mt-4 p-3 bg-velvet-cream rounded flex items-center gap-2">
                <Truck size={14} className="text-gold" />
                <span className="text-[0.78rem]">Tracking: <strong>{order.trackingNumber}</strong></span>
                {order.trackingUrl && (
                  <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-[0.72rem] text-gold ml-auto underline">Track Package →</a>
                )}
              </div>
            )}
          </div>
        )}

        {order.status === 'cancelled' && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-5 flex items-start gap-3">
            <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[0.82rem] font-medium text-red-700">Order Cancelled</p>
              {order.cancelReason && <p className="text-[0.75rem] text-red-600 mt-0.5">{order.cancelReason}</p>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          {/* Left: Items + Addresses */}
          <div className="space-y-5">
            {/* Items */}
            <div className="bg-white border border-black/6 rounded">
              <div className="px-5 py-4 border-b border-black/5">
                <h3 className="text-[0.82rem] font-medium">Order Items ({order.items?.length})</h3>
              </div>
              <div className="divide-y divide-black/4">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex gap-4 p-4">
                    <div className="w-16 h-20 bg-velvet-cream rounded overflow-hidden flex-shrink-0">
                      {item.image && <Image src={item.image} alt={item.name} width={64} height={80} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-[0.85rem] font-medium text-velvet-black">{item.name}</p>
                      {(item.variant?.size || item.variant?.color) && (
                        <p className="text-[0.72rem] text-velvet-muted mt-0.5">
                          {[item.variant.size, item.variant.color].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      <p className="text-[0.72rem] text-velvet-muted mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-base">{fmt(item.price * item.quantity)}</p>
                      <p className="text-[0.68rem] text-velvet-muted">{fmt(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border border-black/6 rounded p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={15} className="text-gold" />
                <h3 className="text-[0.82rem] font-medium">Delivery Address</h3>
              </div>
              {order.shippingAddress && (
                <div className="text-[0.82rem] text-velvet-sub leading-relaxed">
                  <p className="font-medium text-velvet-black">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}</p>
                  <p className="mt-1">📞 {order.shippingAddress.phone}</p>
                </div>
              )}
            </div>

            {/* Payment Info */}
            <div className="bg-white border border-black/6 rounded p-5">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={15} className="text-gold" />
                <h3 className="text-[0.82rem] font-medium">Payment Details</h3>
              </div>
              <div className="space-y-2 text-[0.82rem]">
                <div className="flex justify-between">
                  <span className="text-velvet-muted">Method</span>
                  <span className="capitalize font-medium">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-velvet-muted">Status</span>
                  <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : order.paymentStatus === 'failed' ? 'text-red-500' : 'text-amber-500'}`}>
                    {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                  </span>
                </div>
                {order.razorpayPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-velvet-muted">Transaction ID</span>
                    <span className="font-mono text-[0.72rem]">{order.razorpayPaymentId}</span>
                  </div>
                )}
                {order.paymentMethod === 'qr' && order.qrPayment && (
                  <div className="mt-2 p-2 bg-velvet-cream rounded text-[0.72rem] text-velvet-sub">
                    QR Payment — {order.qrPayment.status === 'pending' ? '⏳ Awaiting admin verification' : order.qrPayment.status === 'approved' ? '✅ Verified & confirmed' : '❌ Rejected'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Summary + Actions */}
          <div className="space-y-4">
            <div className="bg-white border border-black/6 rounded p-5">
              <h3 className="font-serif text-lg font-light mb-4">Price Summary</h3>
              <div className="space-y-2.5 text-[0.82rem]">
                <div className="flex justify-between">
                  <span className="text-velvet-muted">Items ({order.items?.reduce((s, i) => s + i.quantity, 0)})</span>
                  <span>{fmt(order.itemsPrice)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-velvet-muted">Coupon Discount</span>
                    <span className="text-green-600">−{fmt(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-velvet-muted">Shipping</span>
                  <span className={order.shippingPrice === 0 ? 'text-green-600' : ''}>
                    {order.shippingPrice === 0 ? 'FREE' : fmt(order.shippingPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-velvet-muted">GST (18%)</span>
                  <span>{fmt(order.taxPrice)}</span>
                </div>
                <div className="flex justify-between font-medium border-t border-black/6 pt-2.5">
                  <span>Total Paid</span>
                  <span className="font-serif text-xl">{fmt(order.totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {canCancel && (
                <button onClick={handleCancel} disabled={cancelling}
                  className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 transition-colors py-3 rounded-sm text-[0.78rem]">
                  {cancelling ? 'Cancelling...' : '✕ Cancel Order'}
                </button>
              )}
              <a href={`mailto:hello@velvetcart.store?subject=Order ${order.orderId} - Help`}
                className="w-full flex items-center justify-center border border-black/12 hover:border-gold text-velvet-muted hover:text-gold transition-colors py-3 rounded-sm text-[0.78rem]">
                Get Help with Order
              </a>
              <Link href="/products" className="w-full flex items-center justify-center bg-velvet-cream hover:bg-velvet-beige transition-colors py-3 rounded-sm text-[0.78rem] text-velvet-sub">
                Continue Shopping →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
