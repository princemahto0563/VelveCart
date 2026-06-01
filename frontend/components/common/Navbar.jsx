'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useCartStore, useAuthStore, useWishlistStore, useUIStore } from '@/store';
import { productsAPI } from '@/lib/api';
import Image from 'next/image';

const NAV_LINKS = [
  { label: 'New In', href: '/products?sort=-createdAt' },
  {
    label: 'Shop',
    children: [
      { label: 'Jewellery', href: '/products?category=jewellery' },
      { label: 'Fashion', href: '/products?category=fashion' },
      { label: 'Beauty', href: '/products?category=beauty' },
      { label: 'Home & Decor', href: '/products?category=home' },
      { label: 'Accessories', href: '/products?category=accessories' },
    ],
  },
  { label: 'Flash Sale', href: '/products?flash=true' },
  { label: 'Bestsellers', href: '/products?sort=popular' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const searchRef = useRef(null);
  const searchTimer = useRef(null);

  const { items, openCart } = useCartStore();
  const { user, isLoggedIn, logout } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();
  const { searchOpen, openSearch, closeSearch, mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const isHero = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    closeMobileMenu();
    closeSearch();
  }, [pathname]);

  // Search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await productsAPI.search(searchQuery, 6);
        setSearchResults(data.products);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery]);

  const navBg = scrolled || !isHero
    ? 'bg-white/95 backdrop-blur-lg border-b border-black/5 shadow-sm'
    : 'bg-transparent';

  const textColor = scrolled || !isHero ? 'text-velvet-black' : 'text-white';
  const logoColor = scrolled || !isHero ? 'text-velvet-black' : 'text-white';

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="px-[4vw] h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className={`flex items-center gap-2 flex-shrink-0 ${logoColor}`}>
            <div className="w-8 h-8 rounded-full bg-velvet-black flex items-center justify-center">
              <span className="font-serif text-gold text-sm font-medium">V</span>
            </div>
            <span className="font-serif text-xl tracking-[0.08em] hidden sm:block">VelvetCart</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className={`flex items-center gap-1 text-[0.78rem] tracking-[0.1em] uppercase transition-colors hover:text-gold ${textColor}`}>
                    {link.label}
                    <ChevronDown size={12} />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 pt-4 w-48"
                      >
                        <div className="bg-white border border-black/8 shadow-luxury rounded py-2">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block px-5 py-2.5 text-[0.78rem] text-velvet-sub hover:text-velvet-black hover:bg-velvet-cream transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[0.78rem] tracking-[0.1em] uppercase transition-colors hover:text-gold ${textColor} ${pathname === link.href ? 'text-gold' : ''}`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              onClick={openSearch}
              className={`p-2 transition-colors hover:text-gold ${textColor}`}
              aria-label="Search"
            >
              <Search size={19} />
            </button>

            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className={`p-2 transition-colors hover:text-gold relative ${textColor}`}
              aria-label="Wishlist"
            >
              <Heart size={19} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-gold rounded-full text-[8px] text-white flex items-center justify-center font-medium">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Account */}
            <div className="relative group hidden sm:block">
              <Link
                href={isLoggedIn ? '/account' : '/login'}
                className={`p-2 transition-colors hover:text-gold ${textColor}`}
                aria-label="Account"
              >
                <User size={19} />
              </Link>
              {isLoggedIn && (
                <div className="absolute right-0 top-full pt-4 w-44 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                  <div className="bg-white border border-black/8 shadow-luxury rounded py-2">
                    <div className="px-4 py-2 border-b border-black/5 mb-1">
                      <p className="text-[0.75rem] font-medium text-velvet-black truncate">{user?.name}</p>
                      <p className="text-[0.68rem] text-velvet-muted truncate">{user?.email}</p>
                    </div>
                    <Link href="/account" className="block px-4 py-2 text-[0.78rem] text-velvet-sub hover:text-velvet-black hover:bg-velvet-cream">My Account</Link>
                    <Link href="/account/orders" className="block px-4 py-2 text-[0.78rem] text-velvet-sub hover:text-velvet-black hover:bg-velvet-cream">My Orders</Link>
                    {user?.role === 'admin' && (
                      <Link href="/admin" className="block px-4 py-2 text-[0.78rem] text-gold hover:bg-gold/5">Admin Panel</Link>
                    )}
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-[0.78rem] text-red-500 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={openCart}
              className={`p-2 transition-colors hover:text-gold relative ${textColor}`}
              aria-label={`Cart (${cartCount} items)`}
            >
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-3.5 h-3.5 bg-gold rounded-full text-[8px] text-white flex items-center justify-center font-medium"
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </motion.span>
              )}
            </button>

            {/* Mobile menu */}
            <button
              onClick={toggleMobileMenu}
              className={`p-2 lg:hidden transition-colors hover:text-gold ${textColor}`}
            >
              {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden bg-white border-t border-black/5 lg:hidden"
            >
              <div className="px-6 py-4 space-y-1">
                {NAV_LINKS.map((link) =>
                  link.children ? (
                    <div key={link.label}>
                      <p className="text-[0.68rem] tracking-[0.15em] uppercase text-velvet-muted py-2 pt-4">{link.label}</p>
                      {link.children.map((child) => (
                        <Link key={child.href} href={child.href} className="block py-2 text-[0.85rem] text-velvet-sub hover:text-velvet-black">
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link key={link.href} href={link.href} className="block py-2.5 text-[0.9rem] text-velvet-black font-medium border-b border-black/5">
                      {link.label}
                    </Link>
                  )
                )}
                <div className="pt-4 flex flex-col gap-2">
                  {isLoggedIn ? (
                    <>
                      <Link href="/account" className="btn-outline text-center">My Account</Link>
                      <button onClick={logout} className="text-sm text-red-500 py-2">Sign Out</button>
                    </>
                  ) : (
                    <Link href="/login" className="btn-primary text-center">Sign In</Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && closeSearch()}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-white w-full max-w-2xl mx-auto mt-20 rounded-lg shadow-luxury-lg overflow-hidden"
            >
              <div className="flex items-center border-b border-black/8 px-5 py-4 gap-3">
                <Search size={18} className="text-velvet-muted flex-shrink-0" />
                <input
                  ref={searchRef}
                  autoFocus
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-[0.9rem] text-velvet-black placeholder:text-velvet-muted"
                />
                <button onClick={closeSearch} className="text-velvet-muted hover:text-velvet-black">
                  <X size={18} />
                </button>
              </div>

              {searchQuery && (
                <div className="max-h-80 overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-6 text-center text-sm text-velvet-muted">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((product) => (
                      <Link
                        key={product._id}
                        href={`/products/${product.slug}`}
                        onClick={closeSearch}
                        className="flex items-center gap-4 px-5 py-3 hover:bg-velvet-cream transition-colors"
                      >
                        <div className="w-10 h-12 bg-velvet-beige rounded flex-shrink-0 overflow-hidden">
                          {product.images?.[0]?.url && (
                            <Image src={product.images[0].url} alt={product.name} width={40} height={48} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="text-[0.82rem] font-medium text-velvet-black">{product.name}</p>
                          <p className="text-[0.72rem] text-velvet-muted">{product.brand}</p>
                        </div>
                        <div className="ml-auto font-serif text-sm text-velvet-black">₹{product.price?.toLocaleString('en-IN')}</div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-6 text-center text-sm text-velvet-muted">
                      No results for "{searchQuery}"
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <Link
                      href={`/products?search=${searchQuery}`}
                      onClick={closeSearch}
                      className="block text-center py-3 text-[0.78rem] text-gold tracking-luxury uppercase border-t border-black/5 hover:bg-velvet-cream transition-colors"
                    >
                      View all results →
                    </Link>
                  )}
                </div>
              )}

              {!searchQuery && (
                <div className="p-5">
                  <p className="text-[0.68rem] tracking-widest uppercase text-velvet-muted mb-3">Popular Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {['Diamond Pendant', 'Linen Co-ord', 'Satin Scrunchie', 'Perfume', 'Marble Tray'].map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="px-3 py-1.5 border border-black/10 rounded-full text-[0.75rem] text-velvet-sub hover:border-gold hover:text-gold transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
