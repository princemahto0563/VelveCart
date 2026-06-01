'use client';
// ─── Forgot Password ──────────────────────────────────────────────────────────
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) { toast.error('Enter a valid email'); return; }
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="pt-16 min-h-screen bg-velvet-cream flex items-center justify-center px-5 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded border border-black/6 shadow-luxury w-full max-w-md p-8 md:p-10">

        <Link href="/login" className="flex items-center gap-1.5 text-[0.75rem] text-velvet-muted hover:text-velvet-black mb-6 transition-colors">
          <ArrowLeft size={13} /> Back to Login
        </Link>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <Mail size={20} className="text-gold" />
          </div>
          <h1 className="font-serif text-2xl font-light mb-1">Forgot Password?</h1>
          <p className="text-[0.8rem] text-velvet-muted">
            {sent ? "Check your email for the reset link." : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <p className="text-[0.82rem] text-green-700">
                We've sent a password reset link to <strong>{email}</strong>. The link expires in 15 minutes.
              </p>
            </div>
            <p className="text-[0.75rem] text-velvet-muted">Didn't receive it? Check spam or</p>
            <button onClick={() => { setSent(false); }} className="text-[0.78rem] text-gold hover:text-gold-dark underline">
              try again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-luxury" placeholder="hello@example.com" autoFocus />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : 'Send Reset Link'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
