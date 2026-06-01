'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    category: 'Orders & Shipping',
    items: [
      { q: 'How long does delivery take?', a: 'Standard delivery takes 3-5 business days across India. Express delivery (1-2 business days) is available at checkout for select pin codes. We ship via trusted courier partners including BlueDart, Delhivery, and Ekart.' },
      { q: 'Do you offer free shipping?', a: 'Yes! All orders above ₹2,999 get free standard shipping. Orders below ₹2,999 have a flat shipping fee of ₹99.' },
      { q: 'Can I track my order?', a: 'Absolutely. Once your order is shipped, you\'ll receive a tracking link via email and SMS. You can also track from your account dashboard under "My Orders".' },
      { q: 'Do you ship internationally?', a: 'Currently, we only ship within India. International shipping is on our roadmap for 2025.' },
    ],
  },
  {
    category: 'Returns & Refunds',
    items: [
      { q: 'What is your return policy?', a: 'We offer a 7-day hassle-free return policy. Items must be in their original condition, with tags attached and in original packaging. Certain items like earrings, perfumes, and personalized products cannot be returned for hygiene reasons.' },
      { q: 'How do I initiate a return?', a: 'Go to My Account → My Orders → select the order → click "Return Item". Our team will arrange a free pickup within 48 hours.' },
      { q: 'When will I receive my refund?', a: 'Refunds are processed within 5-7 business days after we receive the returned item. Refunds go to your original payment method.' },
    ],
  },
  {
    category: 'Payments',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept UPI (PhonePe, GPay, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking, and manual QR payment. All online payments are processed via Razorpay — a PCI-DSS compliant payment gateway.' },
      { q: 'Is my payment information secure?', a: 'Yes. We use 256-bit SSL encryption and do not store your card details. All payments are processed through Razorpay\'s secure servers.' },
      { q: 'What is QR payment?', a: 'QR payment allows you to pay via any UPI app by scanning our QR code. After payment, upload your payment screenshot. Our team verifies it within 2-4 hours and confirms your order.' },
      { q: 'Do you provide GST invoice?', a: 'Yes! GST invoices are automatically generated for all orders and can be downloaded from your account dashboard.' },
    ],
  },
  {
    category: 'Products',
    items: [
      { q: 'Are your products authentic?', a: 'All products on VelvetCart are 100% authentic. We source directly from brands and authorized distributors. Each product goes through quality verification before listing.' },
      { q: 'How do I find the right size?', a: 'Each product page has a size guide. For jewellery, we specify dimensions and ring sizes. For clothing, we include measurements in cm. When in doubt, our support team can help.' },
      { q: 'Can I cancel my order?', a: 'Orders can be cancelled before they are shipped. Go to My Account → My Orders → Cancel Order. Once shipped, you\'ll need to use our return process instead.' },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-black/6 last:border-0">
      <button onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 hover:text-gold transition-colors">
        <span className="text-[0.88rem] font-medium">{q}</span>
        <ChevronDown size={16} className={`flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="pb-4 text-[0.82rem] text-velvet-sub leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-velvet-cream border-b border-black/6 px-[5vw] py-10 text-center">
        <p className="section-tag">✦ Help Centre</p>
        <h1 className="section-title">Frequently Asked Questions</h1>
        <p className="text-[0.85rem] text-velvet-muted mt-2">
          Can't find your answer? <a href="mailto:hello@velvetcart.store" className="text-gold underline">Contact us</a>
        </p>
      </div>

      <div className="px-[5vw] py-12 max-w-3xl mx-auto">
        {FAQS.map((section) => (
          <div key={section.category} className="mb-10">
            <h2 className="font-serif text-xl font-light text-velvet-black mb-4 pb-2 border-b-2 border-gold/30">
              {section.category}
            </h2>
            <div className="bg-white border border-black/6 rounded px-5">
              {section.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
