'use client';
// ─── HeroSection ──────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    tag: '✦ New Collection — 2025',
    title: 'Luxury Lives\nin the',
    titleEm: 'Details',
    subtitle: 'Curated pieces for the modern connoisseur. Where premium craftsmanship meets timeless aesthetic.',
    cta: 'Explore Collection',
    ctaHref: '/products',
    bg: 'from-[#0a0a0a] via-[#1a1410] to-[#0d0b08]',
    accent: 'radial-gradient(ellipse at 30% 50%,rgba(201,169,110,0.2) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(212,160,160,0.15) 0%,transparent 40%)',
  },
  {
    id: 2,
    tag: '✦ Flash Sale — Up to 60% Off',
    title: 'Premium at',
    titleEm: 'Half the Price',
    subtitle: 'Our biggest sale of the season. Limited pieces, real luxury. Don\'t miss your moment.',
    cta: 'Shop Flash Sale',
    ctaHref: '/products?flash=true',
    bg: 'from-[#100a0a] via-[#1a0f0f] to-[#0d0808]',
    accent: 'radial-gradient(ellipse at 30% 50%,rgba(212,100,100,0.15) 0%,transparent 50%)',
  },
  {
    id: 3,
    tag: '✦ Pinterest\'s Top Picks',
    title: 'Aesthetic',
    titleEm: 'Elevated',
    subtitle: 'The pieces everyone on Pinterest is saving — now available for you. Express your unique aesthetic.',
    cta: 'View Lookbook',
    ctaHref: '/products?tags=aesthetic',
    bg: 'from-[#0a0a0a] via-[#12100e] to-[#0a0a08]',
    accent: 'radial-gradient(ellipse at 30% 60%,rgba(201,169,110,0.18) 0%,transparent 55%)',
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 5500);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <section className={`relative min-h-screen flex items-center bg-gradient-to-br ${slide.bg} overflow-hidden transition-all duration-1000`}>
      {/* Accent bg */}
      <div className="absolute inset-0 transition-all duration-1000" style={{ backgroundImage: slide.accent }} />

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
      }} />

      {/* Content */}
      <div className="relative z-10 px-[6vw] max-w-3xl pt-24 pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[0.7rem] tracking-[0.28em] uppercase text-gold mb-5 opacity-90">{slide.tag}</p>
            <h1 className="font-serif text-[clamp(3.2rem,7vw,5.8rem)] font-light leading-[1.05] text-white mb-5">
              {slide.title}<br />
              <em className="italic text-gold not-italic">{slide.titleEm}</em>
            </h1>
            <p className="text-[0.92rem] text-white/50 leading-relaxed mb-8 max-w-lg">{slide.subtitle}</p>
            <div className="flex flex-wrap gap-4">
              <Link href={slide.ctaHref} className="btn-gold flex items-center gap-2">
                {slide.cta} <ArrowRight size={15} />
              </Link>
              <Link href="/products" className="btn-ghost">
                Browse All
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide controls */}
      <div className="absolute bottom-10 left-[6vw] flex items-center gap-4 z-10">
        <button onClick={() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length)}
          className="w-9 h-9 border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:border-gold hover:text-gold transition-all">
          <ChevronLeft size={16} />
        </button>
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`h-px transition-all duration-300 ${i === current ? 'w-8 bg-gold' : 'w-4 bg-white/30'}`} />
          ))}
        </div>
        <button onClick={() => setCurrent((c) => (c + 1) % SLIDES.length)}
          className="w-9 h-9 border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:border-gold hover:text-gold transition-all">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 right-[6vw] flex flex-col items-center gap-2 z-10">
        <p className="text-[0.6rem] tracking-[0.2em] uppercase text-white/30 rotate-90 mb-4 origin-center translate-y-8">Scroll</p>
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/20" />
      </div>
    </section>
  );
}

// ─── MarqueeBar ───────────────────────────────────────────────────────────────
export function MarqueeBar() {
  const items = ['Free Shipping Over ₹2999', 'Authentic Products', 'Easy Returns', '24/7 Support', 'Secure Payments', "Pinterest's Top Picks", 'GST Invoice Available'];
  const doubled = [...items, ...items];

  return (
    <div className="bg-velvet-black py-3 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-6 text-[0.68rem] tracking-[0.18em] uppercase text-gold/60">
            {item}
            <span className="text-gold/30">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── TrustBar ─────────────────────────────────────────────────────────────────
const TRUST = [
  { icon: '🚚', title: 'Free Delivery', sub: 'On orders above ₹2,999' },
  { icon: '↩️', title: 'Easy Returns', sub: '7-day hassle-free returns' },
  { icon: '🔐', title: 'Secure Checkout', sub: '256-bit SSL encryption' },
  { icon: '⭐', title: '4.9 Star Rated', sub: 'Trusted by 50,000+ buyers' },
];

export function TrustBar() {
  return (
    <div className="bg-velvet-cream border-y border-black/6 px-[5vw] py-4 flex flex-wrap justify-center gap-6 md:justify-between">
      {TRUST.map((t) => (
        <div key={t.title} className="flex items-center gap-3 min-w-[180px]">
          <span className="text-xl">{t.icon}</span>
          <div>
            <p className="text-[0.78rem] font-medium">{t.title}</p>
            <p className="text-[0.68rem] text-velvet-muted">{t.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── CategoriesGrid ───────────────────────────────────────────────────────────
const CAT_FALLBACK = [
  { name: 'Jewellery', slug: 'jewellery', emoji: '💎' },
  { name: 'Fashion', slug: 'fashion', emoji: '👗' },
  { name: 'Beauty', slug: 'beauty', emoji: '🫧' },
  { name: 'Home & Decor', slug: 'home', emoji: '🪨' },
  { name: 'Accessories', slug: 'accessories', emoji: '👜' },
];

export function CategoriesGrid({ categories = [] }) {
  const items = categories.length > 0 ? categories : CAT_FALLBACK;

  return (
    <section className="section-pad">
      <div className="text-center mb-10">
        <p className="section-tag">✦ Explore</p>
        <h2 className="section-title">Shop by Category</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {items.map((cat, i) => (
          <motion.div
            key={cat._id || cat.slug}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              href={`/products?category=${cat.slug}`}
              className="flex-shrink-0 flex flex-col items-center gap-3 group"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-velvet-cream border-2 border-transparent group-hover:border-gold transition-all duration-300 overflow-hidden flex items-center justify-center">
                {cat.image?.url ? (
                  <Image src={cat.image.url} alt={cat.name} width={96} height={96} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <span className="text-2xl">{cat.emoji || '✦'}</span>
                )}
              </div>
              <span className="text-[0.75rem] tracking-wide text-velvet-sub group-hover:text-gold transition-colors whitespace-nowrap">{cat.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── FeaturedProducts ─────────────────────────────────────────────────────────
import ProductCard from '@/components/product/ProductCard';

export function FeaturedProducts({ products = [] }) {
  return (
    <section className="section-pad bg-white">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="section-tag">✦ Curated for You</p>
          <h2 className="section-title">Trending Right Now</h2>
        </div>
        <Link href="/products" className="hidden md:flex items-center gap-2 text-[0.78rem] tracking-luxury uppercase text-velvet-sub hover:text-gold transition-colors">
          View All <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product, i) => (
          <ProductCard key={product._id} product={product} index={i} />
        ))}
      </div>
      <div className="mt-8 text-center md:hidden">
        <Link href="/products" className="btn-outline">View All Products</Link>
      </div>
    </section>
  );
}

// ─── FlashSaleSection ─────────────────────────────────────────────────────────
function Countdown({ endsAt }) {
  const [time, setTime] = useState({ h: '00', m: '00', s: '00' });

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, new Date(endsAt) - Date.now());
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setTime({ h, m, s });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return (
    <div className="flex items-center gap-1.5">
      {[['h', time.h], ['m', time.m], ['s', time.s]].map(([label, val], i) => (
        <div key={label} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-gold text-lg font-light">:</span>}
          <div className="bg-gold/15 border border-gold/25 rounded px-2.5 py-1.5 text-center min-w-[48px]">
            <div className="font-serif text-2xl text-gold leading-none">{val}</div>
            <div className="text-[0.55rem] tracking-[0.15em] uppercase text-white/40 mt-0.5">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FlashSaleSection({ products = [] }) {
  const saleEnd = products[0]?.flashSaleEndsAt || new Date(Date.now() + 8 * 3600000);

  return (
    <section className="bg-velvet-black py-16 px-[5vw]">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="section-title-white">
            Flash <span className="text-gold">Sale</span> <span className="text-gold">✦</span>
          </h2>
          <p className="text-[0.78rem] text-white/40 mt-1">Limited-time offers. Grab them before they're gone.</p>
        </div>
        <Countdown endsAt={saleEnd} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product, i) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Link href={`/products/${product.slug}`}
              className="block bg-white/4 border border-gold/12 rounded overflow-hidden hover:border-gold/35 hover:bg-white/7 transition-all duration-300 group">
              <div className="relative aspect-square bg-white/3 overflow-hidden">
                {product.images?.[0]?.url && (
                  <Image src={product.images[0].url} alt={product.name} fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />
                )}
                <div className="absolute top-2 left-2 bg-red-500 text-white text-[0.6rem] px-2 py-0.5 rounded-sm tracking-wider uppercase">
                  -{product.discountPercent || Math.round(((product.price - (product.flashSalePrice || product.price)) / product.price) * 100)}%
                </div>
              </div>
              <div className="p-3">
                <p className="text-[0.8rem] text-white/80 leading-snug mb-2 line-clamp-2">{product.name}</p>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-serif text-base text-gold">₹{(product.flashSalePrice || product.price).toLocaleString('en-IN')}</span>
                  <span className="text-[0.72rem] text-white/30 line-through">₹{product.price.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-8">
        <Link href="/products?flash=true" className="btn-ghost inline-flex items-center gap-2">
          View All Deals <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}

// ─── TestimonialsSection ──────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Aanya S.', location: 'Mumbai', text: 'Absolutely obsessed! The packaging alone felt like a luxury unboxing video. Jewellery quality is stunning — exactly like the photos. Will definitely order again.', stars: 5 },
  { name: 'Priya M.', location: 'Delhi', text: 'Ordered 3 times now. VelvetCart has ruined every other website for me — the curation, quality, and delivery speed are all 10/10.', stars: 5 },
  { name: 'Kavya R.', location: 'Bangalore', text: 'Saw this brand on Pinterest and immediately ordered. My aesthetic is so elevated now. The linen co-ord fits perfectly and looks incredibly expensive!', stars: 5 },
  { name: 'Meera T.', location: 'Pune', text: 'The marble trinket tray is even more beautiful in person. Arrived perfectly packaged with a handwritten note. So thoughtful!', stars: 5 },
];

export function TestimonialsSection() {
  return (
    <section className="section-pad bg-velvet-cream">
      <div className="text-center mb-10">
        <p className="section-tag">✦ Love Notes</p>
        <h2 className="section-title">What Our Customers Say</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-black/6 rounded p-5"
          >
            <div className="flex mb-3">
              {Array.from({ length: t.stars }).map((_, i) => (
                <span key={i} className="text-gold text-xs">★</span>
              ))}
            </div>
            <p className="text-[0.82rem] text-velvet-sub leading-relaxed italic mb-4">"{t.text}"</p>
            <div className="flex items-center gap-2.5 border-t border-black/5 pt-4">
              <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center font-serif text-sm text-white">
                {t.name[0]}
              </div>
              <div>
                <p className="text-[0.78rem] font-medium">{t.name}</p>
                <p className="text-[0.68rem] text-velvet-muted">{t.location} · Verified Buyer</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── NewsletterSection ────────────────────────────────────────────────────────
export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setSubmitted(true);
  };

  return (
    <section className="bg-velvet-black py-20 px-[5vw] text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-xl mx-auto"
      >
        <p className="text-[0.68rem] tracking-[0.25em] uppercase text-gold mb-4">✦ Stay Connected</p>
        <h2 className="section-title-white mb-3">Stay in the Loop</h2>
        <p className="text-[0.85rem] text-white/40 leading-relaxed mb-8">
          Exclusive drops, early access, style secrets and flash sale alerts — delivered to your inbox.
        </p>
        {submitted ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-gold/10 border border-gold/30 rounded px-6 py-4 text-gold text-sm">
            ✦ Welcome to the VelvetCart family! Check your inbox.
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex border border-gold/30 rounded-sm overflow-hidden max-w-sm mx-auto">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 bg-transparent px-4 py-3.5 text-[0.85rem] text-white placeholder:text-white/25 outline-none"
            />
            <button type="submit" className="bg-gold text-white px-5 text-[0.7rem] tracking-luxury uppercase hover:bg-gold-dark transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </form>
        )}
        <p className="text-[0.68rem] text-white/20 mt-4">No spam. Unsubscribe anytime.</p>
      </motion.div>
    </section>
  );
}
