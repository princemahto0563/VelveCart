export const metadata = { title: 'Terms & Conditions' };

export default function TermsPage() {
  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-velvet-cream border-b border-black/6 px-[5vw] py-10">
        <p className="section-tag">✦ Legal</p>
        <h1 className="section-title">Terms & Conditions</h1>
        <p className="text-[0.78rem] text-velvet-muted mt-1">Last updated: January 2025</p>
      </div>
      <div className="px-[5vw] py-12 max-w-3xl prose prose-sm prose-slate">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using VelvetCart, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>

        <h2>2. Products and Pricing</h2>
        <p>All prices are listed in Indian Rupees (INR) and include applicable taxes. We reserve the right to modify prices at any time. In the event of a pricing error, we will notify you and offer a refund or cancellation.</p>

        <h2>3. Orders and Payment</h2>
        <p>An order is confirmed only after successful payment. For QR payments, confirmation is sent after admin verification within 2-4 hours. We accept UPI, credit/debit cards, net banking, and wallets via Razorpay.</p>

        <h2>4. Shipping and Delivery</h2>
        <p>We ship across India. Standard delivery takes 3-5 business days. We are not responsible for delays caused by courier partners or circumstances beyond our control. Risk of loss transfers to you upon delivery.</p>

        <h2>5. Returns and Refunds</h2>
        <p>Items may be returned within 7 days of delivery in original condition with tags attached. Refunds are processed within 5-7 business days. Items marked as non-returnable (earrings, perfumes, personalized items) cannot be returned.</p>

        <h2>6. User Accounts</h2>
        <p>You are responsible for maintaining the security of your account. You must not share login credentials. VelvetCart is not liable for unauthorized access resulting from your negligence.</p>

        <h2>7. Intellectual Property</h2>
        <p>All content on VelvetCart including images, text, and brand assets are owned by VelvetCart and may not be used without written permission.</p>

        <h2>8. Limitation of Liability</h2>
        <p>VelvetCart's liability is limited to the amount paid for the specific order in dispute. We are not liable for indirect, incidental, or consequential damages.</p>

        <h2>9. Governing Law</h2>
        <p>These terms are governed by the laws of India. Disputes will be subject to the jurisdiction of courts in Mumbai, Maharashtra.</p>

        <h2>10. Contact</h2>
        <p>hello@velvetcart.store | +91 98765 43210</p>
      </div>
    </div>
  );
}
