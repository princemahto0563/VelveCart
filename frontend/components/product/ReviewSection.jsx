'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { reviewsAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button"
          onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)} onClick={() => onChange(star)}>
          <Star size={22} className={star <= (hovered || value) ? 'text-gold fill-gold' : 'text-velvet-beige fill-velvet-beige'} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [ratingDist, setRatingDist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [starValue, setStarValue] = useState(0);
  const { isLoggedIn } = useAuthStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await reviewsAPI.getByProduct(productId);
      setReviews(data.reviews);
      setTotal(data.total);
      setRatingDist(data.ratingDistribution);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [productId]);

  const onSubmit = async (formData) => {
    if (!starValue) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await reviewsAPI.create({ product: productId, rating: starValue, ...formData });
      toast.success('Review submitted!');
      reset(); setStarValue(0); setShowForm(false);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <section className="px-[5vw] py-12 border-t border-black/6 bg-velvet-cream">
      <div className="flex flex-wrap gap-8 justify-between items-start mb-10">
        <div>
          <p className="section-tag">✦ Reviews</p>
          <h2 className="section-title">Customer Reviews</h2>
        </div>
        {isLoggedIn ? (
          <button onClick={() => setShowForm((s) => !s)} className="btn-outline">
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        ) : (
          <Link href="/login" className="btn-outline text-sm">Sign in to Review</Link>
        )}
      </div>

      {/* Rating summary */}
      <div className="flex flex-wrap gap-8 mb-10">
        <div className="text-center">
          <p className="font-serif text-5xl font-light">{avgRating.toFixed(1)}</p>
          <div className="flex justify-center mt-1 mb-1">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={14} className={s <= Math.round(avgRating) ? 'text-gold fill-gold' : 'text-velvet-beige fill-velvet-beige'} />
            ))}
          </div>
          <p className="text-[0.72rem] text-velvet-muted">{total} reviews</p>
        </div>
        <div className="flex-1 min-w-[200px] space-y-1.5">
          {[5,4,3,2,1].map((star) => {
            const count = ratingDist.find((r) => r._id === star)?.count || 0;
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[0.72rem] text-velvet-muted w-3">{star}</span>
                <Star size={11} className="text-gold fill-gold flex-shrink-0" />
                <div className="flex-1 h-1.5 bg-black/8 rounded-full overflow-hidden">
                  <div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[0.68rem] text-velvet-muted w-6">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-black/8 rounded p-6 space-y-4">
              <h3 className="font-serif text-lg font-light">Write Your Review</h3>
              <div>
                <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-2">Your Rating *</label>
                <StarPicker value={starValue} onChange={setStarValue} />
              </div>
              <div>
                <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Review Title *</label>
                <input {...register('title', { required: 'Title is required' })}
                  className="input-luxury" placeholder="Sum up your experience" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Your Review *</label>
                <textarea {...register('body', { required: 'Review is required', minLength: { value: 20, message: 'At least 20 characters' } })}
                  rows={4} className="input-luxury resize-none" placeholder="Tell others about your experience..." />
                {errors.body && <p className="text-red-500 text-xs mt-1">{errors.body.message}</p>}
              </div>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white rounded p-5 space-y-2">
              <div className="skeleton h-3 w-32 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-3/4 rounded" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-serif text-lg text-velvet-muted">No reviews yet</p>
          <p className="text-sm text-velvet-muted mt-1">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <motion.div key={review._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-black/6 rounded p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-white font-serif text-sm flex-shrink-0">
                    {review.user?.avatar ? (
                      <Image src={review.user.avatar} alt={review.user.name} width={36} height={36} className="w-full h-full rounded-full object-cover" />
                    ) : review.user?.name?.[0]}
                  </div>
                  <div>
                    <p className="text-[0.82rem] font-medium">{review.user?.name}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={11} className={s <= review.rating ? 'text-gold fill-gold' : 'text-velvet-beige fill-velvet-beige'} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[0.68rem] text-velvet-muted">{new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  {review.isVerifiedPurchase && (
                    <span className="text-[0.62rem] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-sm">Verified Purchase</span>
                  )}
                </div>
              </div>
              <h4 className="text-[0.85rem] font-medium mb-1">{review.title}</h4>
              <p className="text-[0.82rem] text-velvet-sub leading-relaxed">{review.body}</p>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
