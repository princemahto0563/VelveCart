'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { User, Package, Heart, MapPin, Lock, LogOut, ChevronRight, Star } from 'lucide-react';
import { useAuthStore, useWishlistStore } from '@/store';
import { ordersAPI, authAPI } from '@/lib/api';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  pending: 'badge-pending',
  confirmed: 'badge-processing',
  processing: 'badge-processing',
  shipped: 'badge-shipped',
  delivered: 'badge-delivered',
  cancelled: 'badge-cancelled',
};

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getMyOrders().then(({ data }) => setOrders(data.orders)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3].map((i) => <div key={i} className="skeleton h-28 rounded" />)}
    </div>
  );

  if (orders.length === 0) return (
    <div className="text-center py-16">
      <Package size={40} className="text-velvet-beige mx-auto mb-4" />
      <p className="font-serif text-lg text-velvet-muted">No orders yet</p>
      <p className="text-sm text-velvet-muted mt-1 mb-6">Start shopping to see your orders here</p>
      <Link href="/products" className="btn-primary">Shop Now</Link>
    </div>
  );

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order._id} className="bg-white border border-black/6 rounded p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="text-[0.75rem] text-velvet-muted">Order ID</p>
              <p className="font-medium text-sm">#{order.orderId}</p>
            </div>
            <div className="text-right">
              <span className={STATUS_STYLES[order.status] || 'badge-pending'}>{order.status}</span>
              <p className="text-[0.68rem] text-velvet-muted mt-1">
                {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
            {order.items?.slice(0, 4).map((item, i) => (
              <div key={i} className="w-14 h-16 bg-velvet-cream rounded overflow-hidden flex-shrink-0">
                {item.image && <Image src={item.image} alt={item.name} width={56} height={64} className="w-full h-full object-cover" />}
              </div>
            ))}
            {order.items?.length > 4 && (
              <div className="w-14 h-16 bg-velvet-cream rounded flex items-center justify-center text-xs text-velvet-muted flex-shrink-0">
                +{order.items.length - 4}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-black/5">
            <div>
              <p className="text-[0.72rem] text-velvet-muted">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''} · {order.paymentMethod?.toUpperCase()}</p>
              <p className="font-serif text-base mt-0.5">₹{Number(order.totalPrice).toLocaleString('en-IN')}</p>
            </div>
            <Link href={`/account/orders/${order._id}`} className="flex items-center gap-1 text-[0.78rem] text-gold hover:text-gold-dark transition-colors">
              View Details <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileTab() {
  const { user, setAuth, token } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name || '', phone: user?.phone || '' },
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { data: res } = await authAPI.updateProfile(data);
      setAuth(res.user, token);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center font-serif text-2xl text-white">
          {user?.avatar ? <Image src={user.avatar} alt={user.name} width={64} height={64} className="w-full h-full rounded-full object-cover" /> : user?.name?.[0]}
        </div>
        <div>
          <p className="font-medium">{user?.name}</p>
          <p className="text-sm text-velvet-muted">{user?.email}</p>
          <span className="text-[0.65rem] bg-gold/10 text-gold px-2 py-0.5 rounded-sm uppercase tracking-wider">{user?.role}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Full Name</label>
          <input {...register('name', { required: 'Name is required' })} className="input-luxury" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Phone Number</label>
          <input {...register('phone')} className="input-luxury" />
        </div>
        <div>
          <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Email Address</label>
          <input value={user?.email} disabled className="input-luxury opacity-50 cursor-not-allowed" />
          <p className="text-[0.68rem] text-velvet-muted mt-1">Email cannot be changed</p>
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

function WishlistTab() {
  const { products, toggle } = useWishlistStore();

  if (products.length === 0) return (
    <div className="text-center py-16">
      <Heart size={40} className="text-velvet-beige mx-auto mb-4" />
      <p className="font-serif text-lg text-velvet-muted">Your wishlist is empty</p>
      <p className="text-sm text-velvet-muted mt-1 mb-6">Save products you love for later</p>
      <Link href="/products" className="btn-primary">Browse Products</Link>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product._id} className="product-card group">
          <div className="relative aspect-square overflow-hidden bg-velvet-cream">
            {product.images?.[0]?.url && (
              <Image src={product.images[0].url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="33vw" />
            )}
            <button onClick={() => toggle(product)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-red-500">
              <Heart size={14} fill="currentColor" />
            </button>
          </div>
          <div className="p-3">
            <p className="text-[0.75rem] text-velvet-muted">{product.brand}</p>
            <Link href={`/products/${product.slug}`} className="text-[0.82rem] font-medium hover:text-gold transition-colors line-clamp-2">
              {product.name}
            </Link>
            <p className="font-serif text-base mt-1">₹{product.price?.toLocaleString('en-IN')}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const TABS = [
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    if (!isLoggedIn) router.push('/login');
  }, [isLoggedIn]);

  if (!user) return null;

  return (
    <div className="pt-16 min-h-screen bg-velvet-cream">
      <div className="px-[5vw] py-10">
        <div className="mb-6">
          <p className="section-tag">✦ My Account</p>
          <h1 className="font-serif text-3xl font-light">Welcome, {user.name?.split(' ')[0]}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          {/* Sidebar */}
          <div className="bg-white rounded border border-black/6 p-4 h-fit">
            <nav className="space-y-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded text-[0.82rem] transition-all ${
                    activeTab === id ? 'bg-velvet-black text-white' : 'text-velvet-sub hover:bg-velvet-cream hover:text-velvet-black'
                  }`}>
                  <Icon size={16} /> {label}
                </button>
              ))}
              {user.role === 'admin' && (
                <Link href="/admin" className="w-full flex items-center gap-3 px-4 py-3 rounded text-[0.82rem] text-gold hover:bg-gold/5 transition-all">
                  <Star size={16} /> Admin Panel
                </Link>
              )}
              <button onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded text-[0.82rem] text-red-500 hover:bg-red-50 transition-all mt-4 border-t border-black/6 pt-4">
                <LogOut size={16} /> Sign Out
              </button>
            </nav>
          </div>

          {/* Content */}
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
            className="bg-white rounded border border-black/6 p-6">
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'wishlist' && <WishlistTab />}
            {activeTab === 'addresses' && (
              <div className="text-center py-16">
                <MapPin size={40} className="text-velvet-beige mx-auto mb-4" />
                <p className="font-serif text-lg text-velvet-muted">Manage your addresses at checkout</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
