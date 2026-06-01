export const metadata = { title: 'Returns & Refund Policy' };

export default function ReturnsPage() {
  const steps = [
    { step: '01', title: 'Initiate Return', desc: 'Go to My Account → My Orders → Select order → Click "Return Item" within 7 days of delivery.' },
    { step: '02', title: 'Free Pickup', desc: 'Our courier partner will schedule a free pickup from your address within 48 hours.' },
    { step: '03', title: 'Quality Check', desc: 'We inspect the returned item. It must be in original condition with tags attached.' },
    { step: '04', title: 'Refund Processed', desc: 'Refund is credited to your original payment method within 5-7 business days.' },
  ];

  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-velvet-cream border-b border-black/6 px-[5vw] py-10">
        <p className="section-tag">✦ Returns</p>
        <h1 className="section-title">Returns & Refund Policy</h1>
        <p className="text-[0.85rem] text-velvet-muted mt-2">7-day hassle-free returns on most items</p>
      </div>

      <div className="px-[5vw] py-12 max-w-4xl mx-auto">
        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {steps.map(s => (
            <div key={s.step} className="bg-velvet-cream border border-black/6 rounded p-5">
              <p className="font-serif text-3xl text-gold/30 mb-3">{s.step}</p>
              <h3 className="font-medium text-[0.9rem] mb-2">{s.title}</h3>
              <p className="text-[0.78rem] text-velvet-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-serif text-xl font-light mb-4">✅ Eligible for Return</h2>
            <ul className="space-y-2 text-[0.82rem] text-velvet-sub">
              {['All fashion & clothing items', 'Home decor (undamaged)', 'Beauty tools & accessories', 'Bags and accessories', 'Most jewellery (except earrings)', 'Defective or damaged items'].map(i => (
                <li key={i} className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span>{i}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-xl font-light mb-4">❌ Non-Returnable Items</h2>
            <ul className="space-y-2 text-[0.82rem] text-velvet-sub">
              {['Earrings (hygiene reasons)', 'Opened perfumes & fragrances', 'Personalized/custom items', 'Intimate apparel', 'Items with removed tags', 'Items damaged by customer'].map(i => (
                <li key={i} className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✕</span>{i}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 bg-velvet-black text-white rounded p-6">
          <h3 className="font-serif text-lg mb-2">Received a damaged item?</h3>
          <p className="text-[0.82rem] text-white/50 mb-4">We're sorry about that. Contact us within 48 hours of delivery with photos and we'll replace it or issue a full refund immediately.</p>
          <a href="mailto:hello@velvetcart.store?subject=Damaged Item Report" className="btn-gold inline-block text-sm">Contact Support</a>
        </div>
      </div>
    </div>
  );
}
