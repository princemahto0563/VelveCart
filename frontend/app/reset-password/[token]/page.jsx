'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password', '');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authAPI.resetPassword(token, { password: data.password });
      toast.success('Password reset successfully!');
      router.push('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed — the link may have expired');
    } finally { setLoading(false); }
  };

  return (
    <div className="pt-16 min-h-screen bg-velvet-cream flex items-center justify-center px-5 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded border border-black/6 shadow-luxury w-full max-w-md p-8 md:p-10">

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <Lock size={20} className="text-gold" />
          </div>
          <h1 className="font-serif text-2xl font-light mb-1">Set New Password</h1>
          <p className="text-[0.8rem] text-velvet-muted">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">New Password</label>
            <div className="relative">
              <input
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
                type={showPassword ? 'text' : 'password'}
                className="input-luxury pr-10" placeholder="Min. 6 characters" autoFocus
              />
              <button type="button" onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-velvet-muted hover:text-velvet-black">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Confirm New Password</label>
            <input
              {...register('confirmPassword', {
                required: 'Please confirm password',
                validate: (val) => val === password || 'Passwords do not match',
              })}
              type={showPassword ? 'text' : 'password'}
              className="input-luxury" placeholder="Repeat your password"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : 'Reset Password'}
          </button>
        </form>

        <p className="text-center text-[0.75rem] text-velvet-muted mt-5">
          Remember your password?{' '}
          <Link href="/login" className="text-gold hover:text-gold-dark underline">Sign in →</Link>
        </p>
      </motion.div>
    </div>
  );
}
