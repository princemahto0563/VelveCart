'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Check, Tag, CreditCard, Smartphone, QrCode, ChevronRight, Loader2 } from 'lucide-react';
import { useCartStore, useAuthStore } from '@/store';
import { ordersAPI, paymentsAPI, couponsAPI } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const PAYMENT_METHODS = [
  { id: 'razorpay', label: 'Pay Online', sub: 'UPI, Cards, Net Banking, Wallets', icon: <CreditCard size={18} /> },
  { id: 'qr', label: 'QR Payment', sub: 'Scan & pay, upload screenshot for verification', icon: <QrCode size={18} /> },
  { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when your order arrives', icon: <Smartphone size={18} /> },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const { user, isLoggedIn } = useAuthStore();

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [qrFile, setQrFile] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  // Redirect if not logged in or cart empty
  useEffect(() => {
    if (!isLoggedIn) { router.push('/login?redirect=/checkout'); return; }
    if (items.length === 0) { router.push('/cart'); return; }
    // Pre-fill from user default address
    const addr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
    if (addr) {
      Object.entries(addr).forEach(([k, v]) => setValue(k, v));
    }
    if (user?.phone) setValue('phone', user.phone);
  }, [isLoggedIn, items.length]);

  const discount = couponData?.discount || 0;
  const shippingFee = subtotal >= 2999 ? 0 : 99;
  const taxRate = 0.18;
  const taxAmount = Math.round((subtotal - discount) * taxRate);
  const total = Math.max(0, subtotal - discount + shippingFee + taxAmount);

  const handleCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await couponsAPI.validate({ code: couponCode, orderAmount: subtotal });
      setCouponData(data);
      toast.success(`Coupon applied — ${fmt(data.discount)} saved!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCouponData(null);
    } finally { setCouponLoading(false); }
  };

  const onSubmit = async (addressData) => {
    setOrderLoading(true);
    try {
      // Create order
      const orderPayload = {
        items: items.map((i) => ({
          product: i.product,
          name: i.name,
          image: i.image,
          price: i.price,
          quantity: i.quantity,
          variant: i.variant,
        })),
        shippingAddress: {
          fullName: addressData.fullName,
          phone: addressData.phone,
          addressLine1: addressData.addressLine1,
          addressLine2: addressData.addressLine2,
          city: addressData.city,
          state: addressData.state,
          pincode: addressData.pincode,
        },
        paymentMethod,
        couponCode: couponData ? couponCode : undefined,
      };

      const { data: orderData } = await ordersAPI.create(orderPayload);
      const order = orderData.order;

      if (paymentMethod === 'razorpay') {
        await handleRazorpay(order);
      } else if (paymentMethod === 'qr') {
        await handleQRUpload(order);
      } else {
        // COD
        clearCart();
        router.push(`/checkout/success?orderId=${order._id}&method=cod`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setOrderLoading(false); }
  };

  const handleRazorpay = async (order) => {
    const { data } = await paymentsAPI.createRazorpayOrder({ orderId: order._id });

    const options = {
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: 'VelvetCart',
      description: `Order #${order.orderId}`,
      order_id: data.razorpayOrderId,
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: user?.phone,
      },
      theme: { color: '#c9a96e' },
      modal: {
        ondismiss: () => { toast.error('Payment cancelled'); setOrderLoading(false); },
      },
      handler: async (response) => {
        try {
          await paymentsAPI.verifyRazorpay({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId: order._id,
          });
          clearCart();
          router.push(`/checkout/success?orderId=${order._id}&method=razorpay`);
        } catch {
          toast.error('Payment verification failed. Contact support.');
          router.push(`/checkout/failed?orderId=${order._id}`);
        }
      },
    };

    if (!window.Razorpay) { toast.error('Payment gateway not loaded. Please refresh.'); return; }
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleQRUpload = async (order) => {
    if (!qrFile) { toast.error('Please upload your payment screenshot'); setOrderLoading(false); return; }
    const formData = new FormData();
    formData.append('screenshot', qrFile);
    formData.append('orderId', order._id);
    try {
      await paymentsAPI.uploadQR(formData);
      clearCart();
      router.push(`/checkout/success?orderId=${order._id}&method=qr`);
    } catch {
      toast.error('Failed to upload screenshot. Please try again.');
      setOrderLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setRazorpayLoaded(true)} />

      <div className="pt-20 min-h-screen bg-velvet-cream">
        <div className="px-[5vw] py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[0.72rem] text-velvet-muted mb-6">
            <Link href="/cart" className="hover:text-velvet-black">Cart</Link>
            <ChevronRight size={12} />
            <span className="text-velvet-black font-medium">Checkout</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

              {/* Left: Form */}
              <div className="space-y-6">

                {/* Shipping Address */}
                <div className="bg-white rounded border border-black/6 p-6">
                  <h2 className="font-serif text-xl mb-5">Shipping Address</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Full Name *</label>
                      <input {...register('fullName', { required: 'Full name is required' })}
                        className="input-luxury" placeholder="As on ID" />
                      {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                    </div>
                    <div>
                      <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Phone *</label>
                      <input {...register('phone', { required: 'Phone is required', pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit number' } })}
                        className="input-luxury" placeholder="10-digit mobile" />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>
                    <div>
                      <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Pincode *</label>
                      <input {...register('pincode', { required: 'Pincode is required', pattern: { value: /^\d{6}$/, message: '6-digit pincode' } })}
                        className="input-luxury" placeholder="6-digit pincode" />
                      {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Address Line 1 *</label>
                      <input {...register('addressLine1', { required: 'Address is required' })}
                        className="input-luxury" placeholder="House/Flat No., Building, Street" />
                      {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Address Line 2</label>
                      <input {...register('addressLine2')} className="input-luxury" placeholder="Area, Landmark (optional)" />
                    </div>
                    <div>
                      <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">City *</label>
                      <input {...register('city', { required: 'City is required' })}
                        className="input-luxury" placeholder="City" />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">State *</label>
                      <select {...register('state', { required: 'State is required' })} className="input-luxury">
                        <option value="">Select State</option>
                        {['Andhra Pradesh','Assam','Bihar','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded border border-black/6 p-6">
                  <h2 className="font-serif text-xl mb-5">Payment Method</h2>
                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((method) => (
                      <label key={method.id}
                        className={`flex items-center gap-4 p-4 border rounded cursor-pointer transition-all ${
                          paymentMethod === method.id ? 'border-velvet-black bg-velvet-cream' : 'border-black/10 hover:border-black/25'
                        }`}>
                        <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)} className="sr-only" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          paymentMethod === method.id ? 'border-velvet-black' : 'border-black/25'
                        }`}>
                          {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-velvet-black" />}
                        </div>
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-velvet-muted">{method.icon}</span>
                          <div>
                            <p className="text-[0.85rem] font-medium">{method.label}</p>
                            <p className="text-[0.72rem] text-velvet-muted">{method.sub}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* QR upload */}
                  {paymentMethod === 'qr' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      className="mt-5 p-4 bg-velvet-cream rounded border border-black/8">
                      <p className="text-[0.78rem] font-medium mb-2">Scan & Pay using UPI</p>
                      <div className="flex items-start gap-4">
                        <div className="w-24 h-24 bg-white border border-black/10 rounded flex items-center justify-center text-3xl">
                          📷
                        </div>
                        <div className="flex-1">
                          <p className="text-[0.72rem] text-velvet-muted mb-3">UPI ID: <strong className="text-velvet-black">velvetcart@upi</strong></p>
                          <label className="block">
                            <span className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Upload Payment Screenshot *</span>
                            <input type="file" accept="image/*" onChange={(e) => setQrFile(e.target.files?.[0])}
                              className="block w-full text-sm text-velvet-muted file:mr-3 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:bg-velvet-black file:text-white hover:file:bg-velvet-surface cursor-pointer" />
                          </label>
                          {qrFile && <p className="text-[0.72rem] text-green-600 mt-1">✓ {qrFile.name}</p>}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Right: Order Summary */}
              <div className="space-y-4">
                {/* Items */}
                <div className="bg-white rounded border border-black/6 p-5">
                  <h3 className="font-serif text-lg mb-4">Order Summary ({items.length} item{items.length !== 1 ? 's' : ''})</h3>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.key} className="flex gap-3">
                        <div className="w-14 h-16 bg-velvet-cream rounded overflow-hidden flex-shrink-0">
                          {item.image && <Image src={item.image} alt={item.name} width={56} height={64} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[0.78rem] font-medium text-velvet-black leading-tight truncate">{item.name}</p>
                          {(item.variant?.size || item.variant?.color) && (
                            <p className="text-[0.68rem] text-velvet-muted">{[item.variant.size, item.variant.color].filter(Boolean).join(' · ')}</p>
                          )}
                          <p className="text-[0.72rem] text-velvet-muted">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-serif text-sm flex-shrink-0">{fmt(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Coupon */}
                  <div className="border-t border-black/5 pt-4">
                    <div className="flex gap-2">
                      <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Coupon code" className="input-luxury flex-1 !py-2.5" />
                      <button type="button" onClick={handleCoupon} disabled={couponLoading}
                        className="btn-outline !py-2.5 !px-4 whitespace-nowrap flex items-center gap-1.5">
                        <Tag size={13} /> {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponData && (
                      <p className="text-[0.72rem] text-green-600 mt-1.5 flex items-center gap-1">
                        <Check size={12} /> {couponData.coupon.description} — {fmt(couponData.discount)} off
                      </p>
                    )}
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="bg-white rounded border border-black/6 p-5 space-y-2.5">
                  <div className="flex justify-between text-[0.82rem]">
                    <span className="text-velvet-muted">Subtotal</span><span>{fmt(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[0.82rem]">
                      <span className="text-velvet-muted">Coupon Discount</span>
                      <span className="text-green-600">-{fmt(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[0.82rem]">
                    <span className="text-velvet-muted">Shipping</span>
                    <span className={shippingFee === 0 ? 'text-green-600' : ''}>{shippingFee === 0 ? 'FREE' : fmt(shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-[0.82rem]">
                    <span className="text-velvet-muted">GST (18%)</span>
                    <span>{fmt(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-base border-t border-black/6 pt-2.5">
                    <span>Total</span>
                    <span className="font-serif text-xl">{fmt(total)}</span>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap gap-3 text-[0.68rem] text-velvet-muted">
                  {['🔐 SSL Secure', '✅ Razorpay', '↩️ Easy Returns'].map((t) => (
                    <span key={t} className="flex items-center gap-1">{t}</span>
                  ))}
                </div>

                {/* Place order */}
                <button type="submit" disabled={orderLoading}
                  className="btn-gold w-full flex items-center justify-center gap-2 text-base py-4">
                  {orderLoading ? (
                    <><Loader2 size={16} className="animate-spin" /> Processing...</>
                  ) : (
                    <>Place Order — {fmt(total)}</>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
