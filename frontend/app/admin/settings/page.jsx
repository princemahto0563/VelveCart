'use client';

import { useState, useEffect } from 'react';
import { Loader2, Eye, EyeOff, Save } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState({});

  useEffect(() => {
    adminAPI.getSettings()
      .then(({ data }) => setSettings(data.settings))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateSettings({ settings });
      toast.success('Settings saved successfully!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const set = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));
  const toggle = (key) => setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));

  if (loading) return <div className="text-white/25 text-sm py-8">Loading settings...</div>;

  const sections = [
    {
      title: 'General', fields: [
        { key: 'siteName', label: 'Site Name', type: 'text' },
        { key: 'siteTagline', label: 'Tagline', type: 'text' },
        { key: 'currency', label: 'Currency Code', type: 'text' },
      ]
    },
    {
      title: 'Shipping', fields: [
        { key: 'freeShippingThreshold', label: 'Free Shipping Above (₹)', type: 'number' },
        { key: 'standardShippingCost', label: 'Standard Shipping Cost (₹)', type: 'number' },
      ]
    },
    {
      title: 'Razorpay Integration', fields: [
        { key: 'razorpayKeyId', label: 'Razorpay Key ID', type: 'text', hint: 'Starts with rzp_live_ or rzp_test_' },
        { key: 'razorpayKeySecret', label: 'Razorpay Key Secret', type: 'password' },
        { key: 'razorpayWebhookSecret', label: 'Webhook Secret', type: 'password' },
      ]
    },
    {
      title: 'QR / Manual Payment', fields: [
        { key: 'qrUpiId', label: 'UPI ID', type: 'text', hint: 'Shown to customer for manual payment' },
        { key: 'qrImageUrl', label: 'QR Code Image URL', type: 'text', hint: 'Upload via Cloudinary and paste URL here' },
        { key: 'qrPaymentInstructions', label: 'Payment Instructions', type: 'text' },
      ]
    },
    {
      title: 'Social Media', fields: [
        { key: 'instagramUrl', label: 'Instagram URL', type: 'text' },
        { key: 'pinterestUrl', label: 'Pinterest URL', type: 'text' },
        { key: 'whatsappNumber', label: 'WhatsApp Number (with country code)', type: 'text' },
      ]
    },
    {
      title: 'Email / Contact', fields: [
        { key: 'supportEmail', label: 'Support Email', type: 'email' },
        { key: 'businessPhone', label: 'Business Phone', type: 'text' },
      ]
    },
  ];

  return (
    <div className="text-white space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.62rem] tracking-[0.2em] uppercase text-gold/60 mb-1">✦ Configuration</p>
          <h1 className="font-serif text-2xl font-light">Site Settings</h1>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-gold text-velvet-black text-[0.78rem] tracking-wide uppercase px-5 py-2.5 rounded-sm hover:bg-gold-dark transition-colors">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="bg-[#1a1816] border border-gold/10 rounded p-5">
          <h2 className="text-[0.78rem] font-medium text-white mb-4 pb-3 border-b border-white/8">{section.title}</h2>
          <div className="space-y-4">
            {section.fields.map(({ key, label, type, hint }) => (
              <div key={key}>
                <label className="text-[0.68rem] uppercase tracking-wide text-white/35 block mb-1.5">{label}</label>
                <div className="relative">
                  <input
                    type={type === 'password' && !showSecrets[key] ? 'password' : type === 'password' ? 'text' : type}
                    value={settings[key] || ''}
                    onChange={(e) => set(key, e.target.value)}
                    className="input-dark w-full pr-10"
                    placeholder={hint || label}
                  />
                  {type === 'password' && (
                    <button type="button" onClick={() => toggle(key)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                      {showSecrets[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                </div>
                {hint && <p className="text-[0.65rem] text-white/20 mt-1">{hint}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Tax */}
      <div className="bg-[#1a1816] border border-gold/10 rounded p-5">
        <h2 className="text-[0.78rem] font-medium text-white mb-4 pb-3 border-b border-white/8">Tax Settings</h2>
        <div>
          <label className="text-[0.68rem] uppercase tracking-wide text-white/35 block mb-1.5">GST Rate (%)</label>
          <input type="number" value={settings.taxRate || 18} onChange={(e) => set('taxRate', Number(e.target.value))}
            className="input-dark w-32" min={0} max={100} />
          <p className="text-[0.65rem] text-white/20 mt-1">Applied to all orders during checkout</p>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-red-500/5 border border-red-500/15 rounded p-5">
        <h2 className="text-[0.78rem] font-medium text-red-400 mb-1">Danger Zone</h2>
        <p className="text-[0.72rem] text-white/30 mb-4">These actions are irreversible. Proceed with caution.</p>
        <div className="flex gap-3 flex-wrap">
          <button className="border border-red-500/25 text-red-400 text-[0.72rem] px-4 py-2 rounded-sm hover:bg-red-500/10 transition-colors">
            Clear All Coupons
          </button>
          <button className="border border-red-500/25 text-red-400 text-[0.72rem] px-4 py-2 rounded-sm hover:bg-red-500/10 transition-colors">
            Reset Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
