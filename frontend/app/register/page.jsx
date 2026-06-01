'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password', '');

  const passwordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = passwordStrength();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500'][strength];

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { data: res } = await authAPI.register({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });
      setAuth(res.user, res.token);
      toast.success(`Welcome to VelvetCart, ${res.user.name.split(' ')[0]}! ✦`);
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-velvet-black flex items-center justify-center">
              <span className="font-serif text-gold text-lg">V</span>
            </div>
            <span className="font-serif text-xl tracking-[0.08em]">VelvetCart</span>
          </Link>
          <p className="text-[0.72rem] text-velvet-muted mt-1 tracking-[0.15em] uppercase">Create your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Full Name *</label>
            <input
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })}
              className="input-luxury" placeholder="Your full name" autoComplete="name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Email Address *</label>
            <input
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Valid email required' } })}
              type="email" className="input-luxury" placeholder="hello@example.com" autoComplete="email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Phone Number</label>
            <input
              {...register('phone', { pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit number' } })}
              type="tel" className="input-luxury" placeholder="10-digit mobile number" autoComplete="tel"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Password *</label>
            <div className="relative">
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'At least 6 characters' },
                })}
                type={showPassword ? 'text' : 'password'}
                className="input-luxury pr-10" placeholder="Min. 6 characters" autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-velvet-muted hover:text-velvet-black">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-black/8'}`} />
                  ))}
                </div>
                <p className="text-[0.68rem] text-velvet-muted">{strengthLabel} password</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Confirm Password *</label>
            <input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === password || 'Passwords do not match',
              })}
              type={showPassword ? 'text' : 'password'}
              className="input-luxury" placeholder="Repeat your password" autoComplete="new-password"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex items-start gap-2 mt-1">
            <input
              {...register('agreeTerms', { required: 'You must agree to terms' })}
              type="checkbox" id="terms" className="mt-0.5 accent-velvet-black"
            />
            <label htmlFor="terms" className="text-[0.75rem] text-velvet-muted leading-relaxed">
              I agree to VelvetCart's{' '}
              <Link href="/terms" className="text-velvet-black underline">Terms & Conditions</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-velvet-black underline">Privacy Policy</Link>
            </label>
          </div>
          {errors.agreeTerms && <p className="text-red-500 text-xs">{errors.agreeTerms.message}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Creating Account...</> : 'Create Account'}
          </button>
        </form>

        {/* Benefits */}
        <div className="mt-6 p-4 bg-velvet-cream rounded space-y-2">
          {['Free shipping on first order', 'Exclusive member-only deals', 'Early access to new arrivals'].map((b) => (
            <div key={b} className="flex items-center gap-2 text-[0.75rem] text-velvet-sub">
              <Check size={12} className="text-gold flex-shrink-0" /> {b}
            </div>
          ))}
        </div>

        <p className="text-center text-[0.8rem] text-velvet-muted mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-velvet-black font-medium hover:text-gold transition-colors">Sign in →</Link>
        </p>
      </motion.div>
    </div>
  );
}
