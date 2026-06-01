'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, Settings,
  QrCode, BarChart2, LogOut, Menu, X, ChevronRight, Bell
} from 'lucide-react';
import { useAuthStore } from '@/store';

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag, badge: 'orders' },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'QR Payments', href: '/admin/qr-payments', icon: QrCode, badge: 'qr' },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Coupons', href: '/admin/coupons', icon: Tag },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { router.push('/login'); return; }
    if (user?.role !== 'admin') { router.push('/'); return; }
  }, [isLoggedIn, user]);

  if (!user || user.role !== 'admin') return null;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gold/10 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center">
          <span className="font-serif text-velvet-black text-sm font-medium">V</span>
        </div>
        <div>
          <span className="font-serif text-white text-base tracking-[0.06em]">VelvetCart</span>
          <span className="block text-[0.55rem] tracking-[0.18em] uppercase text-gold/50">Admin Panel</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-[0.8rem] transition-all ${
                isActive ? 'bg-gold/15 text-gold' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              }`}>
              <Icon size={16} />
              <span>{label}</span>
              {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-gold" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/8 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center font-serif text-gold text-sm">
            {user?.name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[0.78rem] text-white truncate">{user?.name}</p>
            <p className="text-[0.65rem] text-white/35 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="w-full flex items-center gap-2 text-[0.75rem] text-white/30 hover:text-red-400 transition-colors">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0d0c0a] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[200px] bg-[#141210] border-r border-gold/10 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            className="fixed left-0 top-0 h-full w-[200px] bg-[#141210] z-50 lg:hidden">
            <SidebarContent />
          </motion.aside>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-[#141210] border-b border-gold/10 px-5 h-14 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/50 hover:text-white">
              <Menu size={20} />
            </button>
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-1.5 text-[0.72rem] text-white/30">
              <span>Admin</span>
              <ChevronRight size={12} />
              <span className="text-white/60 capitalize">
                {pathname.split('/').filter(Boolean).slice(1).join(' / ') || 'Dashboard'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-1.5 text-white/40 hover:text-white transition-colors">
              <Bell size={17} />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <Link href="/" target="_blank" className="text-[0.72rem] text-gold/60 hover:text-gold transition-colors">
              View Store →
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
