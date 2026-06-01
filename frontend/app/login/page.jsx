'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const sessionExpired = searchParams.get('session') === 'expired';

  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { data: res } = await authAPI.login(data);
      setAuth(res.user, res.token);
      toast.success(`Welcome back, ${res.user.name.split(' ')[0]}! ✦`);
      router.push(redirect);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-velvet-cream flex items-center justify-center px-5 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded border border-black/6 shadow-luxury w-full max-w-md p-8 md:p-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-velvet-black flex items-center justify-center">
              <span className="font-serif text-gold text-lg">V</span>
            </div>
            <span className="font-serif text-xl tracking-[0.08em]">VelvetCart</span>
          </Link>
          <p className="text-[0.72rem] text-velvet-muted mt-1 tracking-[0.15em] uppercase">Sign in to your account</p>
        </div>

        {sessionExpired && (
          <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-5 text-[0.78rem] text-amber-700 text-center">
            Your session expired. Please sign in again.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Email Address</label>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
              })}
              type="email"
              className="input-luxury"
              placeholder="hello@example.com"
              autoComplete="email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted">Password</label>
              <Link href="/forgot-password" className="text-[0.72rem] text-gold hover:text-gold-dark transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                {...register('password', { required: 'Password is required' })}
                type={showPassword ? 'text' : 'password'}
                className="input-luxury pr-10"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-velvet-muted hover:text-velvet-black transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Signing In...</> : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/8" /></div>
          <div className="relative text-center"><span className="bg-white px-3 text-[0.72rem] text-velvet-muted">OR</span></div>
        </div>

        {/* Google OAuth placeholder */}
        <button
          onClick={() => toast('Google login coming soon!')}
          className="w-full flex items-center justify-center gap-3 border border-black/12 rounded-sm py-3 text-[0.82rem] text-velvet-sub hover:bg-velvet-cream transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-[0.8rem] text-velvet-muted mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-velvet-black font-medium hover:text-gold transition-colors">
            Create one →
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
