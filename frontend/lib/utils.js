// ─── Currency ─────────────────────────────────────────────────────────────────
export const formatPrice = (amount) =>
  `₹${Number(amount || 0).toLocaleString('en-IN')}`;

export const formatPriceShort = (amount) => {
  const n = Number(amount || 0);
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n}`;
};

// ─── Date ─────────────────────────────────────────────────────────────────────
export const formatDate = (date, opts = {}) =>
  new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', ...opts
  });

export const formatDateTime = (date) =>
  new Date(date).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ─── String ───────────────────────────────────────────────────────────────────
export const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const truncate = (str, maxLen = 100) =>
  str && str.length > maxLen ? `${str.slice(0, maxLen)}...` : str;

export const stripHtml = (html) =>
  html ? html.replace(/<[^>]+>/g, '') : '';

// ─── Validation ───────────────────────────────────────────────────────────────
export const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
export const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);
export const isValidPincode = (pincode) => /^\d{6}$/.test(pincode);

// ─── Discount ─────────────────────────────────────────────────────────────────
export const calcDiscount = (original, sale) => {
  if (!original || !sale || original <= sale) return 0;
  return Math.round(((original - sale) / original) * 100);
};

// ─── Cart ─────────────────────────────────────────────────────────────────────
export const calcCartTotals = (items, discountAmount = 0) => {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingFee = subtotal >= 2999 ? 0 : 99;
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxable * 0.18);
  const total = taxable + shippingFee + taxAmount;
  return { subtotal, shippingFee, taxAmount, total };
};

// ─── Image ────────────────────────────────────────────────────────────────────
export const getOptimizedImageUrl = (url, width = 800) => {
  if (!url) return '/placeholder-product.jpg';
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
  }
  return url;
};

// ─── Order status ─────────────────────────────────────────────────────────────
export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const PAYMENT_STATUS_LABELS = {
  pending: 'Awaiting Payment',
  paid: 'Paid',
  failed: 'Payment Failed',
  refunded: 'Refunded',
};

// ─── Pinterest share URL ──────────────────────────────────────────────────────
export const getPinterestShareUrl = (pageUrl, imageUrl, description) =>
  `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(pageUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(description)}`;

// ─── WhatsApp share ───────────────────────────────────────────────────────────
export const getWhatsAppShareUrl = (text) =>
  `https://wa.me/?text=${encodeURIComponent(text)}`;
