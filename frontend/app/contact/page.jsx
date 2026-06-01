'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageCircle, MapPin, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    // In production, send this to your backend or a service like Formspree
    await new Promise((r) => setTimeout(r, 1200));
    toast.success("Message sent! We'll reply within 24 hours.");
    reset();
    setLoading(false);
  };

  const CHANNELS = [
    { icon: Mail, label: 'Email Us', value: 'hello@velvetcart.store', href: 'mailto:hello@velvetcart.store', sub: 'Reply within 24 hours' },
    { icon: MessageCircle, label: 'WhatsApp', value: '+91 98765 43210', href: 'https://wa.me/919876543210', sub: 'Mon–Sat, 10am–7pm' },
    { icon: Phone, label: 'Call Us', value: '+91 98765 43210', href: 'tel:+919876543210', sub: 'Mon–Sat, 10am–7pm' },
    { icon: MapPin, label: 'Location', value: 'Mumbai, Maharashtra, India', href: '#', sub: 'HQ (Not for walk-ins)' },
  ];

  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-velvet-cream border-b border-black/6 px-[5vw] py-10 text-center">
        <p className="section-tag">✦ Get in Touch</p>
        <h1 className="section-title">Contact Us</h1>
        <p className="text-[0.85rem] text-velvet-muted mt-2">We'd love to hear from you. Our team is always here to help.</p>
      </div>

      <div className="px-[5vw] py-12 grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
        {/* Contact channels */}
        <div>
          <h2 className="font-serif text-xl font-light mb-6">Reach Out</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {CHANNELS.map(({ icon: Icon, label, value, href, sub }) => (
              <a key={label} href={href} target={href.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="bg-velvet-cream border border-black/6 rounded p-4 hover:border-gold transition-all group">
                <div className="w-8 h-8 bg-gold/10 rounded flex items-center justify-center mb-3 group-hover:bg-gold/20 transition-colors">
                  <Icon size={16} className="text-gold" />
                </div>
                <p className="text-[0.72rem] text-velvet-muted uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-[0.82rem] font-medium text-velvet-black">{value}</p>
                <p className="text-[0.68rem] text-velvet-muted mt-0.5">{sub}</p>
              </a>
            ))}
          </div>

          <div className="bg-velvet-black rounded p-5 text-white">
            <p className="font-serif text-lg mb-2">Need help with an order?</p>
            <p className="text-[0.8rem] text-white/45 leading-relaxed mb-4">
              For order-related queries, sign in to your account and go to My Orders → select your order → click "Get Help". This is the fastest way to resolve order issues.
            </p>
            <a href="/account/orders" className="text-gold text-[0.78rem] underline">Go to My Orders →</a>
          </div>
        </div>

        {/* Contact form */}
        <div>
          <h2 className="font-serif text-xl font-light mb-6">Send a Message</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Your Name *</label>
                <input {...register('name', { required: 'Name required' })} className="input-luxury" placeholder="Full name" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Email *</label>
                <input {...register('email', { required: 'Email required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Valid email required' } })}
                  type="email" className="input-luxury" placeholder="hello@email.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Subject *</label>
              <select {...register('subject', { required: 'Please select a subject' })} className="input-luxury">
                <option value="">Select a subject</option>
                <option>Order Issue</option>
                <option>Return / Refund</option>
                <option>Product Question</option>
                <option>Payment Issue</option>
                <option>Wholesale / Bulk Enquiry</option>
                <option>Brand Collaboration</option>
                <option>Other</option>
              </select>
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
            </div>

            <div>
              <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Order ID (if applicable)</label>
              <input {...register('orderId')} className="input-luxury" placeholder="e.g. #VC2891" />
            </div>

            <div>
              <label className="text-[0.72rem] uppercase tracking-wide text-velvet-muted block mb-1.5">Message *</label>
              <textarea {...register('message', { required: 'Message required', minLength: { value: 10, message: 'At least 10 characters' } })}
                rows={5} className="input-luxury resize-none" placeholder="Describe your query in detail..." />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={15} className="animate-spin" /> Sending...</> : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
