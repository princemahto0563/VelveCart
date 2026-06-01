import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, wishlistAPI } from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Cart Store ───────────────────────────────────────────────────────────────
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (product, variant = {}, quantity = 1) => {
        const { items } = get();
        const key = `${product._id}-${variant.size || ''}-${variant.color || ''}`;
        const existing = items.find((i) => i.key === key);

        if (existing) {
          set({
            items: items.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                key,
                product: product._id,
                name: product.name,
                brand: product.brand,
                image: product.images?.[0]?.url || '',
                price: product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price,
                originalPrice: product.price,
                quantity,
                variant,
                slug: product.slug,
              },
            ],
          });
        }

        set({ isOpen: true });
        toast.success(`${product.name} added to cart`);
      },

      removeItem: (key) => {
        set((s) => ({ items: s.items.filter((i) => i.key !== key) }));
      },

      updateQuantity: (key, quantity) => {
        if (quantity < 1) return get().removeItem(key);
        set((s) => ({
          items: s.items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => set({ items: [] }),

      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      get subtotal() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },
    }),
    {
      name: 'vc-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// ─── Auth Store ───────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setAuth: (user, token) => {
        set({ user, token });
        if (typeof window !== 'undefined') {
          localStorage.setItem('vc_token', token);
          localStorage.setItem('vc_user', JSON.stringify(user));
        }
      },

      logout: () => {
        set({ user: null, token: null });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('vc_token');
          localStorage.removeItem('vc_user');
        }
        window.location.href = '/';
      },

      fetchMe: async () => {
        const token = get().token;
        if (!token) return;
        try {
          set({ isLoading: true });
          const { data } = await authAPI.me();
          set({ user: data.user });
        } catch {
          get().logout();
        } finally {
          set({ isLoading: false });
        }
      },

      get isAdmin() {
        return get().user?.role === 'admin';
      },

      get isLoggedIn() {
        return !!get().token;
      },
    }),
    {
      name: 'vc-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

// ─── Wishlist Store ───────────────────────────────────────────────────────────
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [], // product IDs
      products: [], // populated products

      isInWishlist: (productId) => get().items.includes(productId),

      toggle: async (product) => {
        const { items } = get();
        const isIn = items.includes(product._id);

        // Optimistic update
        if (isIn) {
          set((s) => ({
            items: s.items.filter((id) => id !== product._id),
            products: s.products.filter((p) => p._id !== product._id),
          }));
          toast('Removed from wishlist', { icon: '♡' });
        } else {
          set((s) => ({
            items: [...s.items, product._id],
            products: [...s.products, product],
          }));
          toast.success('Added to wishlist ♡');
        }

        // Sync with server if logged in
        try {
          const token = localStorage.getItem('vc_token');
          if (token) await wishlistAPI.toggle(product._id);
        } catch {
          // Revert on error
          set((s) =>
            isIn
              ? { items: [...s.items, product._id], products: [...s.products, product] }
              : { items: s.items.filter((id) => id !== product._id), products: s.products.filter((p) => p._id !== product._id) }
          );
        }
      },

      hydrate: async () => {
        try {
          const token = localStorage.getItem('vc_token');
          if (!token) return;
          const { data } = await wishlistAPI.get();
          set({
            products: data.wishlist,
            items: data.wishlist.map((p) => p._id),
          });
        } catch { /* silent */ }
      },
    }),
    {
      name: 'vc-wishlist',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// ─── UI Store (search, modals) ────────────────────────────────────────────────
export const useUIStore = create((set) => ({
  searchOpen: false,
  mobileMenuOpen: false,
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
}));
