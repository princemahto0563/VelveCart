// ─── About Page ───────────────────────────────────────────────────────────────
import Link from 'next/link';

export const metadata = { title: 'About VelvetCart' };

export default function AboutPage() {
  const values = [
    { emoji: '✦', title: 'Curated Excellence', desc: 'Every product is hand-picked by our team for quality, aesthetic appeal, and value.' },
    { emoji: '🌿', title: 'Sustainable Luxury', desc: 'We partner with brands that prioritize ethical sourcing and sustainable practices.' },
    { emoji: '🤝', title: 'Customer First', desc: 'From easy returns to 24/7 support, your satisfaction is our top priority.' },
    { emoji: '💎', title: 'Authentic Products', desc: '100% authentic products, verified before they reach your doorstep.' },
  ];

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="bg-velvet-black py-24 px-[5vw] text-center">
        <p className="text-[0.68rem] tracking-[0.25em] uppercase text-gold mb-4">✦ Our Story</p>
        <h1 className="font-serif text-4xl md:text-5xl font-light text-white mb-5 max-w-xl mx-auto">
          Luxury Reimagined for the Modern Buyer
        </h1>
        <p className="text-[0.88rem] text-white/45 max-w-lg mx-auto leading-relaxed">
          VelvetCart was born from a simple belief: premium, aesthetic products shouldn't cost a fortune. We curate the finest jewellery, fashion, beauty and lifestyle pieces — and deliver them to your door.
        </p>
      </section>

      {/* Values */}
      <section className="section-pad bg-velvet-cream">
        <div className="text-center mb-10">
          <p className="section-tag">✦ What We Stand For</p>
          <h2 className="section-title">Our Values</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <div key={v.title} className="bg-white border border-black/6 rounded p-6 text-center">
              <div className="text-2xl mb-3">{v.emoji}</div>
              <h3 className="font-serif text-lg font-light mb-2">{v.title}</h3>
              <p className="text-[0.8rem] text-velvet-muted leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-velvet-black py-16 px-[5vw]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: '50,000+', label: 'Happy Customers' },
            { val: '4.9★', label: 'Average Rating' },
            { val: '500+', label: 'Products Curated' },
            { val: '3-5 Days', label: 'Avg. Delivery' },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-serif text-3xl text-gold mb-1">{s.val}</p>
              <p className="text-[0.75rem] text-white/35 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad text-center">
        <h2 className="section-title mb-4">Ready to elevate your aesthetic?</h2>
        <Link href="/products" className="btn-primary">Shop the Collection</Link>
      </section>
    </div>
  );
}
