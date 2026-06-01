'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { productsAPI, categoriesAPI } from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

const SORT_OPTIONS = [
  { label: 'Newest First', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
];

function ProductSkeleton() {
  return (
    <div className="rounded overflow-hidden border border-black/5">
      <div className="skeleton" style={{ aspectRatio: '3/4' }} />
      <div className="p-3.5 space-y-2">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-5 w-28 rounded mt-2" />
      </div>
    </div>
  );
}

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters from URL params
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const search = searchParams.get('search') || '';
  const flash = searchParams.get('flash') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = Number(searchParams.get('page') || 1);

  const setParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productsAPI.getAll({
        page, limit: 12, sort,
        category: category || undefined,
        search: search || undefined,
        flash: flash || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
      });
      setProducts(data.products);
      setPagination(data.pagination);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [page, sort, category, search, flash, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => {
    categoriesAPI.getAll().then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  const activeFilters = [
    category && { label: `Category: ${category}`, clear: () => setParam('category', '') },
    flash && { label: 'Flash Sale', clear: () => setParam('flash', '') },
    minPrice && { label: `Min: ₹${minPrice}`, clear: () => setParam('minPrice', '') },
    maxPrice && { label: `Max: ₹${maxPrice}`, clear: () => setParam('maxPrice', '') },
    search && { label: `"${search}"`, clear: () => setParam('search', '') },
  ].filter(Boolean);

  return (
    <div className="bg-white">
      {/* Page header */}
      <div className="bg-velvet-cream border-b border-black/6 px-[5vw] py-8">
        <p className="section-tag">✦ Catalogue</p>
        <h1 className="font-serif text-3xl font-light">
          {flash ? 'Flash Sale' : search ? `Results for "${search}"` : category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All Products'}
        </h1>
        {!loading && <p className="text-[0.78rem] text-velvet-muted mt-1">{pagination.total} products</p>}
      </div>

      <div className="px-[5vw] py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter toggle */}
            <button onClick={() => setFiltersOpen((s) => !s)}
              className="flex items-center gap-2 border border-black/15 rounded-sm px-4 py-2.5 text-[0.78rem] hover:border-velvet-black transition-colors">
              <SlidersHorizontal size={14} /> Filters
              {activeFilters.length > 0 && (
                <span className="w-4 h-4 bg-velvet-black text-white rounded-full text-[0.6rem] flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* Active filter chips */}
            {activeFilters.map((f) => (
              <div key={f.label} className="flex items-center gap-1.5 bg-velvet-black text-white text-[0.72rem] px-3 py-1.5 rounded-full">
                {f.label}
                <button onClick={f.clear}><X size={12} /></button>
              </div>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-[0.72rem] text-velvet-muted">Sort:</span>
            <select value={sort} onChange={(e) => setParam('sort', e.target.value)}
              className="border border-black/12 rounded-sm px-3 py-2 text-[0.78rem] outline-none cursor-pointer">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden mb-6">
            <div className="bg-velvet-cream border border-black/8 rounded p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Category */}
              <div>
                <p className="text-[0.68rem] uppercase tracking-wide text-velvet-muted mb-2">Category</p>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="cat" checked={!category} onChange={() => setParam('category', '')} className="accent-velvet-black" />
                    <span className="text-[0.8rem]">All</span>
                  </label>
                  {categories.map((c) => (
                    <label key={c._id} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="cat" checked={category === c.slug} onChange={() => setParam('category', c.slug)} className="accent-velvet-black" />
                      <span className="text-[0.8rem]">{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <p className="text-[0.68rem] uppercase tracking-wide text-velvet-muted mb-2">Price Range (₹)</p>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setParam('minPrice', e.target.value)}
                    className="input-luxury !py-2 w-full text-sm" />
                  <span className="text-velvet-muted">–</span>
                  <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setParam('maxPrice', e.target.value)}
                    className="input-luxury !py-2 w-full text-sm" />
                </div>
              </div>

              {/* Special */}
              <div>
                <p className="text-[0.68rem] uppercase tracking-wide text-velvet-muted mb-2">Special</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={flash === 'true'} onChange={(e) => setParam('flash', e.target.checked ? 'true' : '')} className="accent-velvet-black" />
                  <span className="text-[0.8rem]">Flash Sale Only</span>
                </label>
              </div>

              <div className="flex items-end">
                <button onClick={() => { setParam('category', ''); setParam('flash', ''); setParam('minPrice', ''); setParam('maxPrice', ''); setFiltersOpen(false); }}
                  className="text-[0.75rem] text-velvet-muted hover:text-velvet-black underline">
                  Clear all filters
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-xl text-velvet-muted">No products found</p>
            <p className="text-sm text-velvet-muted mt-2">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: pagination.pages }).map((_, i) => (
              <button key={i} onClick={() => setParam('page', String(i + 1))}
                className={`w-9 h-9 rounded-sm text-sm transition-all ${
                  i + 1 === page ? 'bg-velvet-black text-white' : 'border border-black/12 hover:border-velvet-black'
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
