'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, X, Loader2, ImagePlus } from 'lucide-react';
import { productsAPI, categoriesAPI, adminAPI } from '@/lib/api';
import Image from 'next/image';
import toast from 'react-hot-toast';

const EMPTY_PRODUCT = {
  name: '', slug: '', brand: '', shortDescription: '', description: '',
  category: '', price: '', originalPrice: '', stock: '', tags: '',
  isFeatured: false, isFlashSale: false, isActive: true,
  images: [], specifications: [], variants: [],
};

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProducts = async (p = 1, q = '') => {
    setLoading(true);
    try {
      const { data } = await productsAPI.getAll({ page: p, limit: 12, search: q || undefined });
      setProducts(data.products);
      setTotal(data.pagination.total);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchProducts();
    categoriesAPI.getAll().then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_PRODUCT); setShowModal(true); };
  const openEdit = (product) => {
    setEditing(product);
    setForm({
      ...product,
      category: product.category?._id || product.category,
      tags: product.tags?.join(', ') || '',
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('images', f));
      const { data } = await adminAPI.uploadProductImages(fd);
      setForm((prev) => ({ ...prev, images: [...prev.images, ...data.images] }));
      toast.success(`${data.images.length} image(s) uploaded`);
    } catch { toast.error('Image upload failed'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) {
      toast.error('Name, price and category are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.name),
        tags: typeof form.tags === 'string' ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : form.tags,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice) || Number(form.price),
        stock: Number(form.stock) || 0,
      };

      if (editing) {
        await productsAPI.update(editing._id, payload);
        toast.success('Product updated!');
      } else {
        await productsAPI.create(payload);
        toast.success('Product created!');
      }
      setShowModal(false);
      fetchProducts(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    try {
      await productsAPI.delete(product._id);
      toast.success('Product removed');
      fetchProducts(page);
    } catch { toast.error('Delete failed'); }
  };

  const filteredProducts = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div className="text-white space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.62rem] tracking-[0.2em] uppercase text-gold/60 mb-1">✦ Catalogue</p>
          <h1 className="font-serif text-2xl font-light">Products</h1>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-gold text-velvet-black text-[0.78rem] tracking-wide uppercase px-4 py-2.5 rounded-sm hover:bg-gold-dark transition-colors">
          <Plus size={15} /> Add Product
        </button>
      </div>

      {/* Search + filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..." className="w-full bg-[#1a1816] border border-gold/10 rounded-sm pl-9 pr-4 py-2.5 text-[0.82rem] text-white placeholder:text-white/25 outline-none focus:border-gold/30" />
        </div>
      </div>

      {/* Products table */}
      <div className="bg-[#1a1816] border border-gold/10 rounded overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-white/25 text-sm">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-white/25 text-sm">No products found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[0.62rem] tracking-[0.14em] uppercase text-white/25 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-white/5 rounded overflow-hidden flex-shrink-0">
                          {product.images?.[0]?.url && (
                            <Image src={product.images[0].url} alt={product.name} width={40} height={48} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="text-[0.8rem] text-white/80 font-medium">{product.name}</p>
                          <p className="text-[0.68rem] text-white/30">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[0.75rem] text-white/40 capitalize">{product.category?.name || '—'}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-serif text-[0.9rem] text-gold">₹{product.price?.toLocaleString('en-IN')}</p>
                      {product.originalPrice > product.price && (
                        <p className="text-[0.65rem] text-white/25 line-through">₹{product.originalPrice?.toLocaleString('en-IN')}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[0.72rem] px-2 py-0.5 rounded-sm ${product.stock <= 5 ? 'bg-red-500/15 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        {product.isFeatured && <span className="text-[0.62rem] bg-gold/15 text-gold px-1.5 py-0.5 rounded-sm w-fit">Featured</span>}
                        {product.isFlashSale && <span className="text-[0.62rem] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-sm w-fit">Flash Sale</span>}
                        {!product.isActive && <span className="text-[0.62rem] bg-white/10 text-white/30 px-1.5 py-0.5 rounded-sm w-fit">Hidden</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(product)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-white/50 hover:text-white transition-all">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(product)} className="p-1.5 bg-white/5 hover:bg-red-500/20 rounded text-white/50 hover:text-red-400 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-8 pb-4 px-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-[#141210] border border-gold/15 rounded w-full max-w-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gold/10">
                <h2 className="font-serif text-lg text-white">{editing ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white"><X size={18} /></button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Images */}
                <div>
                  <label className="text-[0.68rem] uppercase tracking-wide text-white/35 block mb-2">Product Images</label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {form.images?.map((img, i) => (
                      <div key={i} className="relative w-16 h-20 rounded overflow-hidden bg-white/5">
                        <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
                        <button onClick={() => setForm((p) => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                          className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white">
                          <X size={9} />
                        </button>
                      </div>
                    ))}
                    <label className="w-16 h-20 border border-dashed border-gold/20 rounded flex flex-col items-center justify-center cursor-pointer hover:border-gold/40 transition-colors">
                      {uploading ? <Loader2 size={18} className="text-gold animate-spin" /> : <ImagePlus size={18} className="text-white/30" />}
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>

                {/* Basic fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[0.68rem] uppercase tracking-wide text-white/35 block mb-1.5">Product Name *</label>
                    <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value, slug: slugify(e.target.value) }))}
                      className="input-dark w-full" placeholder="e.g. Celestine Diamond Pendant" />
                  </div>
                  <div>
                    <label className="text-[0.68rem] uppercase tracking-wide text-white/35 block mb-1.5">Brand *</label>
                    <input value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
                      className="input-dark w-full" placeholder="Brand name" />
                  </div>
                  <div>
                    <label className="text-[0.68rem] uppercase tracking-wide text-white/35 block mb-1.5">Category *</label>
                    <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      className="input-dark w-full">
                      <option value="">Select category</option>
                      {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[0.68rem] uppercase tracking-wide text-white/35 block mb-1.5">Sale Price (₹) *</label>
                    <input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                      className="input-dark w-full" placeholder="4999" />
                  </div>
                  <div>
                    <label className="text-[0.68rem] uppercase tracking-wide text-white/35 block mb-1.5">Original Price (₹) *</label>
                    <input type="number" value={form.originalPrice} onChange={(e) => setForm((p) => ({ ...p, originalPrice: e.target.value }))}
                      className="input-dark w-full" placeholder="7999" />
                  </div>
                  <div>
                    <label className="text-[0.68rem] uppercase tracking-wide text-white/35 block mb-1.5">Stock *</label>
                    <input type="number" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                      className="input-dark w-full" placeholder="25" />
                  </div>
                  <div>
                    <label className="text-[0.68rem] uppercase tracking-wide text-white/35 block mb-1.5">Tags (comma separated)</label>
                    <input value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                      className="input-dark w-full" placeholder="luxury, gold, pendant" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[0.68nm] uppercase tracking-wide text-white/35 block mb-1.5">Short Description</label>
                    <input value={form.shortDescription} onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))}
                      className="input-dark w-full" placeholder="One-line product summary" maxLength={300} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[0.68rem] uppercase tracking-wide text-white/35 block mb-1.5">Full Description</label>
                    <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      rows={4} className="input-dark w-full resize-none" placeholder="Full product description (HTML supported)" />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex gap-4 flex-wrap">
                  {[
                    { key: 'isFeatured', label: 'Featured Product' },
                    { key: 'isFlashSale', label: 'Flash Sale' },
                    { key: 'isActive', label: 'Active / Visible' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <div onClick={() => setForm((p) => ({ ...p, [key]: !p[key] }))}
                        className={`w-9 h-5 rounded-full transition-colors relative ${form[key] ? 'bg-gold' : 'bg-white/10'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form[key] ? 'left-4' : 'left-0.5'}`} />
                      </div>
                      <span className="text-[0.75rem] text-white/50">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-gold/10">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-white/10 rounded-sm text-[0.78rem] text-white/40 hover:border-white/25 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-2.5 bg-gold text-velvet-black rounded-sm text-[0.78rem] font-medium hover:bg-gold-dark transition-colors flex items-center justify-center gap-2">
                  {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : (editing ? 'Update Product' : 'Create Product')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
