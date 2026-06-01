'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Loader2, Copy, Check } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const EMPTY = {
  code: '', type: 'percentage', value: '', minOrderAmount: '', maxDiscount: '',
  usageLimit: '', userLimit: 1, validFrom: '', validUntil: '', description: '', isActive: true,
};

function CouponModal({ coupon, onClose, onSave }) {
  const [form, setForm] = useState(coupon || EMPTY);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.code || !form.value || !form.validFrom || !form.validUntil) {
      toast.error('Fill all required fields'); return;
    }
    setSaving(true);
    try {
      if (coupon?._id) {
        await adminAPI.updateCoupon(coupon._id, form);
        toast.success('Coupon updated!');
      } else {
        await adminAPI.createCoupon(form);
        toast.success('Coupon created!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
        className="bg-[#141210] border border-gold/15 rounded w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold/10">
          <h2 className="font-serif text-lg text-white">{coupon?._id ? 'Edit Coupon' : 'Create Coupon'}</h2>
          <button onClick={onClose}><X size={18} className="text-white/30 hover:text-white" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[0.68rem] uppercase tracking-wide text-white/35 block mb-1.5">Code *</label>
              <input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())}
                className="input-dark w-full uppercase" placeholder="VELVET20" />
            </div>
            <div>
              <label className="text-[0.68rem] uppercase tracking-wide text-white/35 block mb-1.5">Type *</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className="input-dark w-full">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-[0.68rem] uppercase tracking-wide text-white/35 block mb-1.5">
                {form.type === 'percentage' ? 'Discount %' : 'Discount ₹'} *
              </label>
              <input type="number" value={form.value} onChange={e => set('value', e.target.value)}
                className="input-dark w-full" placeholder={form.type === 'percentage' ? '10' : '200'} />
            </div>
            <div>
              <label className="text-[0.68rem] uppercase tracking-wide text-white/35 block mb-1.5">Min Order (₹)</label>
              <input type="number" value={form.minOrderAmount} onChange={e => set('minOrderAmount', e.target.value)}
                className="input-dark w-full" placeholder="999" />
            </div>
            {form.type === 'percentage' && (
              <div>
                <label className="text-[0.68rem] uppercase tracking-wide text-white/35 block mb-1.5">Max Discount (₹)</label>
                <input type="number" value={form.maxDiscount} onChange={e => set('maxDiscount', e.target.value)}
                  className="input-dark w-full" placeholder="500" />
              </div>
            )}
            <div>
              <label className="text-[0.68rem] uppercase tracking-wide text-white/35 block mb-1.5">Total Usage Limit</label>
              <input type="number" value={form.usageLimit} onChange={e => set('usageLimit', e.target.value)}
                className="input-dark w-full" placeholder="Empty = unlimited" />
            </div>
            <div>
              <label className="text-[0.68rem] uppercase tracking-wide text-white/35 block mb-1.5">Per User Limit</label>
              <input type="number" value={form.userLimit} onChange={e => set('userLimit', e.target.value)}
                className="input-dark w-full" placeholder="1" />
            </div>
            <div>
              <label className="text-[0.68rem] uppercase tracking-wide text-white/35 block mb-1.5">Valid From *</label>
              <input type="datetime-local" value={form.validFrom} onChange={e => set('validFrom', e.target.value)}
                className="input-dark w-full" />
            </div>
            <div>
              <label className="text-[0.68rem] uppercase tracking-wide text-white/35 block mb-1.5">Valid Until *</label>
              <input type="datetime-local" value={form.validUntil} onChange={e => set('validUntil', e.target.value)}
                className="input-dark w-full" />
            </div>
            <div className="col-span-2">
              <label className="text-[0.68rem] uppercase tracking-wide text-white/35 block mb-1.5">Description</label>
              <input value={form.description} onChange={e => set('description', e.target.value)}
                className="input-dark w-full" placeholder="10% off on orders above ₹999" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => set('isActive', !form.isActive)}
              className={`w-9 h-5 rounded-full transition-colors relative ${form.isActive ? 'bg-gold' : 'bg-white/10'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isActive ? 'left-4' : 'left-0.5'}`} />
            </div>
            <span className="text-[0.75rem] text-white/50">Active</span>
          </label>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gold/10">
          <button onClick={onClose} className="flex-1 py-2.5 border border-white/10 rounded-sm text-[0.78rem] text-white/40 hover:border-white/25 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 bg-gold text-velvet-black rounded-sm text-[0.78rem] font-medium hover:bg-gold-dark transition-colors flex items-center justify-center gap-2">
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : (coupon?._id ? 'Update' : 'Create Coupon')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | coupon object
  const [copied, setCopied] = useState(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getCoupons();
      setCoupons(data.coupons);
    } catch { toast.error('Failed to load coupons'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleDelete = async (coupon) => {
    if (!confirm(`Delete coupon "${coupon.code}"?`)) return;
    try {
      await adminAPI.deleteCoupon(coupon._id);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch { toast.error('Delete failed'); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const isExpired = (coupon) => new Date(coupon.validUntil) < new Date();
  const usagePct = (coupon) => coupon.usageLimit ? Math.round((coupon.usedCount / coupon.usageLimit) * 100) : 0;

  return (
    <div className="text-white space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.62rem] tracking-[0.2em] uppercase text-gold/60 mb-1">✦ Promotions</p>
          <h1 className="font-serif text-2xl font-light">Coupons</h1>
        </div>
        <button onClick={() => setModal('create')}
          className="flex items-center gap-2 bg-gold text-velvet-black text-[0.78rem] tracking-wide uppercase px-4 py-2.5 rounded-sm hover:bg-gold-dark transition-colors">
          <Plus size={15} /> New Coupon
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-36 bg-[#1a1816] rounded animate-pulse" />)}
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-[#1a1816] border border-gold/10 rounded py-16 text-center">
          <p className="text-white/20 text-sm">No coupons yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coupons.map(coupon => (
            <div key={coupon._id} className={`bg-[#1a1816] border rounded p-5 ${isExpired(coupon) || !coupon.isActive ? 'border-white/8 opacity-60' : 'border-gold/12'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => copyCode(coupon.code)}
                    className="font-mono text-lg font-bold text-gold flex items-center gap-2 hover:opacity-80 transition-opacity">
                    {coupon.code}
                    {copied === coupon.code ? <Check size={14} className="text-green-400" /> : <Copy size={13} className="text-gold/50" />}
                  </button>
                  {isExpired(coupon) && <span className="text-[0.62rem] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-sm">Expired</span>}
                  {!coupon.isActive && !isExpired(coupon) && <span className="text-[0.62rem] bg-white/10 text-white/30 px-1.5 py-0.5 rounded-sm">Inactive</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setModal(coupon)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-white/40 hover:text-white transition-all">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(coupon)} className="p-1.5 bg-white/5 hover:bg-red-500/20 rounded text-white/40 hover:text-red-400 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <p className="text-[0.75rem] text-white/50 mb-2">{coupon.description || '—'}</p>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-[0.65rem] bg-gold/10 text-gold px-2 py-0.5 rounded-sm">
                  {coupon.type === 'percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`}
                </span>
                {coupon.minOrderAmount > 0 && (
                  <span className="text-[0.65rem] bg-white/8 text-white/40 px-2 py-0.5 rounded-sm">
                    Min ₹{coupon.minOrderAmount}
                  </span>
                )}
                {coupon.maxDiscount && (
                  <span className="text-[0.65rem] bg-white/8 text-white/40 px-2 py-0.5 rounded-sm">
                    Cap ₹{coupon.maxDiscount}
                  </span>
                )}
              </div>

              {coupon.usageLimit && (
                <div className="mb-2">
                  <div className="flex justify-between text-[0.65rem] text-white/30 mb-1">
                    <span>Usage</span>
                    <span>{coupon.usedCount} / {coupon.usageLimit}</span>
                  </div>
                  <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${usagePct(coupon)}%` }} />
                  </div>
                </div>
              )}

              <p className="text-[0.65rem] text-white/20 mt-2">
                {new Date(coupon.validFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                {' → '}
                {new Date(coupon.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
              </p>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <CouponModal
            coupon={modal === 'create' ? null : modal}
            onClose={() => setModal(null)}
            onSave={() => { setModal(null); fetchCoupons(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
