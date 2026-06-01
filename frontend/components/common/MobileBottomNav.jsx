'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react';
import { useCartStore, useWishlistStore, useUIStore } from '@/store';

const NAV_ITEMS = [
  { href: '/',        icon: Home,       label: 'Home'     },
  { href: null,       icon: Search,     label: 'Search',  action: 'search' },
  { href: '/cart',    icon: ShoppingBag,label: 'Cart'     },
  { href: '/account/wishlist', icon: Heart, label: 'Saved' },
  { href: '/account', icon: User,       label: 'Account'  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { items } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { openSearch } = useUIStore();

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  // Hide on admin pages
  if (pathname.startsWith('/admin')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-black/8 pb-safe">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map(({ href, icon: Icon, label, action }) => {
          const isActive = href && (href === '/' ? pathname === '/' : pathname.startsWith(href));

          const content = (
            <span className={`flex flex-col items-center gap-0.5 relative ${isActive ? 'text-velvet-black' : 'text-velvet-muted'}`}>
              <span className="relative">
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                {label === 'Cart' && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-gold rounded-full text-[7px] text-white flex items-center justify-center font-medium">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
                {label === 'Saved' && wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-rose rounded-full text-[7px] text-white flex items-center justify-center font-medium">
                    {wishlistItems.length}
                  </span>
                )}
              </span>
              <span className="text-[9px] tracking-wide">{label}</span>
              {isActive && <span className="absolute -bottom-1 w-4 h-0.5 bg-velvet-black rounded-full" />}
            </span>
          );

          if (action === 'search') {
            return (
              <button key={label} onClick={openSearch} className="flex flex-col items-center flex-1 py-2">
                {content}
              </button>
            );
          }

          return (
            <Link key={label} href={href} className="flex flex-col items-center flex-1 py-2">
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
