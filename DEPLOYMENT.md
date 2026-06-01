# VelvetCart — Complete Deployment Guide

## 🗂 Project Structure

```
velvetcart/
├── backend/          ← Node.js + Express API
│   ├── config/       ← Cloudinary config
│   ├── middleware/   ← Auth, error handling
│   ├── models/       ← Mongoose schemas
│   ├── routes/       ← All API routes
│   ├── services/     ← Email service
│   ├── utils/        ← Seed script
│   ├── server.js     ← Entry point
│   └── render.yaml   ← Render deployment
└── frontend/         ← Next.js 14 App Router
    ├── app/          ← Pages & layouts
    ├── components/   ← Reusable components
    ├── lib/          ← API client
    ├── store/        ← Zustand stores
    └── vercel.json   ← Vercel deployment
```

---

## ⚡ Quick Start (Local Development)

### 1. Clone & install

```bash
# Backend
cd velvetcart/backend
npm install
cp .env.example .env
# Fill in .env values (see below)

# Frontend
cd ../frontend
npm install
cp .env.example .env.local
# Fill in .env.local values
```

### 2. Start development servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# Runs on http://localhost:3000
```

### 3. Seed the database

```bash
cd backend
npm run seed
# Creates admin user, 8 products, categories, coupons, settings
```

**Default admin credentials:**
- Email: `admin@velvetcart.store`
- Password: `Admin@2025`

---

## 🗄 MongoDB Atlas Setup

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free account
2. Create a new **Cluster** (M0 Free Tier is fine to start)
3. Under **Database Access** → Add a database user with read/write permissions
4. Under **Network Access** → Add `0.0.0.0/0` (allow all IPs) for Render/Vercel
5. Click **Connect** → **Connect your application** → Copy the URI
6. Replace `<password>` in the URI with your user's password
7. Add to backend `.env` as `MONGODB_URI`

---

## ☁️ Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier)
2. Dashboard → Copy **Cloud Name**, **API Key**, **API Secret**
3. Add to backend `.env`

---

## 💳 Razorpay Setup

1. Sign up at [razorpay.com](https://razorpay.com) and complete KYC
2. Dashboard → Settings → API Keys → Generate Live Key
3. Copy **Key ID** and **Key Secret** → Add to backend `.env`
4. Set up Webhook:
   - Dashboard → Webhooks → Add New Webhook
   - URL: `https://api.velvetcart.store/api/payments/webhook`
   - Events: `payment.captured`, `payment.failed`
   - Copy Webhook Secret → Add to backend `.env`
5. In admin panel → Settings → enter Razorpay keys (can be updated without redeployment)

---

## 📧 Email (Gmail SMTP) Setup

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Security → 2-Step Verification → Enable
3. App Passwords → Create password for "Mail"
4. Copy the 16-character password → Add as `SMTP_PASS` in `.env`
5. Set `SMTP_USER` to your Gmail address

---

## 🚀 Backend Deployment (Render)

1. Push backend code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo → Select `backend` folder
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
5. Add all environment variables from `.env`
6. Deploy → Copy the service URL (e.g., `https://velvetcart-api.onrender.com`)
7. Add this URL as `NEXT_PUBLIC_API_URL` in frontend `.env.local`

> **Note:** Free Render instances sleep after 15 min. Upgrade to Starter ($7/mo) for always-on.

---

## 🌐 Frontend Deployment (Vercel)

1. Push frontend code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo → Select `frontend` folder
4. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://velvetcart-api.onrender.com/api
   NEXT_PUBLIC_SITE_URL=https://velvetcart.store
   NEXT_PUBLIC_RAZORPAY_KEY=rzp_live_xxxxxxxxxxxx
   ```
5. Deploy → Vercel gives you a `.vercel.app` domain
6. Add your custom domain under Project Settings → Domains

---

## 🌍 Domain Setup

1. Buy domain at Namecheap / GoDaddy / Cloudflare
   - Recommended: `velvetcart.store` or `velvetcart.in`
2. **Frontend (Vercel):**
   - Vercel Dashboard → Settings → Domains → Add `velvetcart.store`
   - Point your domain's A record to Vercel's IP: `76.76.21.21`
3. **Backend (Render):**
   - Render Dashboard → Settings → Custom Domain → `api.velvetcart.store`
   - Add CNAME record: `api` → `velvetcart-api.onrender.com`
4. SSL is automatic on both Vercel and Render ✅

---

## 📌 Pinterest Setup

1. Go to [business.pinterest.com](https://business.pinterest.com) → Create account
2. Claim your website: Settings → Claimed Accounts → Add website
3. Add the verification meta tag to `app/layout.jsx` under `metadata.verification`
4. Enable Rich Pins:
   - Go to [developers.pinterest.com/tools/url-debugger](https://developers.pinterest.com/tools/url-debugger)
   - Enter your product URL → Apply for Rich Pins
5. Your products will now show price and availability on Pinterest automatically ✅

---

## 🔐 Admin Panel Access

After deployment:

1. Navigate to `https://velvetcart.store/admin`
2. Login with admin credentials set in `.env`
3. First steps:
   - Settings → Add Razorpay keys
   - Settings → Upload QR code image
   - Products → Add your real products
   - Settings → Update social media links

---

## 📱 PWA / Mobile App

The site is mobile-optimized. To add PWA support:

1. Create `frontend/public/manifest.json`:
```json
{
  "name": "VelvetCart",
  "short_name": "VelvetCart",
  "description": "Luxury shopping reimagined",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f5f0e8",
  "theme_color": "#0a0a0a",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 🧪 Testing the Complete Flow

After setup, test this full flow:

1. ✅ Register a new user account
2. ✅ Browse and search products
3. ✅ Add items to cart (cart persists after refresh)
4. ✅ Apply coupon code: `VELVET10`
5. ✅ Checkout → Razorpay test payment
6. ✅ Check order in `/account/orders`
7. ✅ Admin login → View order in dashboard
8. ✅ Admin → Change order status to "Shipped"
9. ✅ Test QR payment flow (upload screenshot)
10. ✅ Admin → QR Payments → Approve

---

## 🔑 Default Coupon Codes

| Code | Type | Value | Min Order |
|------|------|-------|-----------|
| `VELVET10` | 10% off | Max ₹500 | ₹999 |
| `WELCOME200` | Flat ₹200 | — | ₹1,499 |
| `LUXURY20` | 20% off | Max ₹1,500 | ₹3,999 |

---

## 📊 Scaling Checklist

When you start getting real traffic:

- [ ] Upgrade MongoDB Atlas to M10+ cluster
- [ ] Enable MongoDB Atlas Search for better full-text search
- [ ] Upgrade Render to paid plan (no sleep)
- [ ] Add Redis for session caching
- [ ] Set up Cloudflare CDN in front of Vercel
- [ ] Enable Vercel Analytics for Core Web Vitals
- [ ] Add Sentry for error tracking
- [ ] Set up automated database backups

---

## 🐛 Common Issues & Fixes

**CORS errors:** Ensure `FRONTEND_URL` in backend `.env` exactly matches your Vercel URL (no trailing slash).

**Razorpay not loading:** Check that `NEXT_PUBLIC_RAZORPAY_KEY` starts with `rzp_live_` (not `rzp_test_` in production).

**Images not showing:** Verify Cloudinary credentials and that `res.cloudinary.com` is in `next.config.js` `remotePatterns`.

**Admin route not protected:** Ensure `JWT_SECRET` is the same string in both `.env` (never change it after users exist).

**MongoDB connection failed:** Check Atlas Network Access — IP `0.0.0.0/0` must be whitelisted.

**Emails not sending:** Use Gmail App Password (not your regular password). 2FA must be enabled first.

---

## 📞 Support

- 📧 Email: hello@velvetcart.store
- 💬 WhatsApp: +91 98765 43210
- 📚 Docs: velvetcart.store/docs

---

*VelvetCart — Built with ✦ for the modern luxury buyer.*
