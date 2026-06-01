export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-velvet-cream border-b border-black/6 px-[5vw] py-10">
        <p className="section-tag">✦ Legal</p>
        <h1 className="section-title">Privacy Policy</h1>
        <p className="text-[0.78rem] text-velvet-muted mt-1">Last updated: January 2025</p>
      </div>
      <div className="px-[5vw] py-12 max-w-3xl prose prose-sm prose-slate">
        <h2>1. Information We Collect</h2>
        <p>When you create an account or place an order, we collect your name, email address, phone number, and shipping address. We also collect payment information, though card details are processed by Razorpay and never stored on our servers.</p>

        <h2>2. How We Use Your Information</h2>
        <p>We use your information to process orders and payments, send order confirmations and shipping updates, provide customer support, send promotional emails (only with your consent), and improve our products and services.</p>

        <h2>3. Data Security</h2>
        <p>We implement industry-standard security measures including 256-bit SSL encryption, bcrypt password hashing, and JWT-based authentication. Payment data is handled by Razorpay, a PCI-DSS Level 1 compliant payment processor.</p>

        <h2>4. Cookies</h2>
        <p>We use essential cookies to maintain your shopping cart and login session. We do not use third-party advertising cookies.</p>

        <h2>5. Data Sharing</h2>
        <p>We do not sell your personal data. We share data only with service providers necessary to operate our business: courier partners for delivery, Razorpay for payment processing, and Cloudinary for image storage.</p>

        <h2>6. Your Rights</h2>
        <p>You may request access to, correction of, or deletion of your personal data by contacting us at hello@velvetcart.store. We will respond within 30 days.</p>

        <h2>7. Contact</h2>
        <p>For privacy concerns: hello@velvetcart.store</p>
      </div>
    </div>
  );
}
