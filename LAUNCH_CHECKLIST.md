# VelvetCart Production Launch Checklist ✦

## ✅ PRE-LAUNCH CHECKLIST

### Backend Setup
- [ ] Clone/upload backend to GitHub
- [ ] Create MongoDB Atlas account → M0 free cluster
- [ ] Add `0.0.0.0/0` to Atlas Network Access
- [ ] Copy connection URI → set as `MONGODB_URI`
- [ ] Run `npm run seed` to create admin + products
- [ ] Deploy to Render → copy service URL
- [ ] Test health check: `https://api.velvetcart.store/api/health`

### Frontend Setup
- [ ] Clone/upload frontend to GitHub
- [ ] Deploy to Vercel → connect GitHub repo
- [ ] Add all env variables in Vercel dashboard
- [ ] Connect custom domain → `velvetcart.store`
- [ ] Test homepage loads correctly
- [ ] Test login/register flow

### Payment Setup
- [ ] Create Razorpay account at razorpay.com
- [ ] Complete KYC (business or individual)
- [ ] Generate Live API keys (Key ID + Key Secret)
- [ ] Add keys to backend `.env`
- [ ] Create webhook: URL = `https://api.velvetcart.store/api/payments/webhook`
- [ ] Select events: `payment.captured`, `payment.failed`
- [ ] Copy webhook secret → add to `.env` as `RAZORPAY_KEY_SECRET`
- [ ] Test payment with live card (₹1 test)
- [ ] Enter Razorpay keys in Admin → Settings → Razorpay

### Email Setup
- [ ] Create/use Gmail account for business
- [ ] Enable 2-Factor Authentication on Gmail
- [ ] Generate App Password (myaccount.google.com → Security → App Passwords)
- [ ] Add `SMTP_USER` (your gmail) and `SMTP_PASS` (app password)
- [ ] Test welcome email on registration

### Admin Setup
- [ ] Login to admin: `yoursite.com/admin`
- [ ] Default credentials: `admin@velvetcart.store` / `Admin@2025`
- [ ] ⚠️ CHANGE ADMIN PASSWORD IMMEDIATELY
- [ ] Add your real products with photos
- [ ] Upload Cloudinary product images
- [ ] Set your UPI QR code in Settings → QR Payment
- [ ] Configure social media links in Settings

### Cloudinary Setup
- [ ] Create free Cloudinary account
- [ ] Copy Cloud Name, API Key, API Secret
- [ ] Add to backend `.env`
- [ ] Upload test product image from admin panel

### Pinterest Setup
- [ ] Create Pinterest Business account
- [ ] Claim website (add meta tag to layout.jsx)
- [ ] Apply for Rich Pins at developers.pinterest.com
- [ ] Test product pin shows price and availability

### SEO
- [ ] Submit sitemap to Google Search Console: `yoursite.com/sitemap.xml`
- [ ] Verify domain in Google Search Console
- [ ] Add Google Analytics (optional but recommended)
- [ ] Test Open Graph tags at opengraph.xyz

---

## 🔑 ALL ENVIRONMENT VARIABLES

### Backend (.env)
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/velvetcart
JWT_SECRET=minimum_32_character_random_secret_here
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hello@velvetcart.store
SMTP_PASS=your_gmail_app_password
FROM_EMAIL=hello@velvetcart.store
FROM_NAME=VelvetCart
FRONTEND_URL=https://velvetcart.store
ADMIN_EMAIL=admin@velvetcart.store
ADMIN_PASSWORD=YourSecureAdminPassword@2025
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://api.velvetcart.store/api
NEXT_PUBLIC_SITE_URL=https://velvetcart.store
NEXT_PUBLIC_RAZORPAY_KEY=rzp_live_xxxxxxxxxxxx
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_verification_code
```

---

## 🚀 DEPLOYMENT COMMANDS

### Backend (Render)
```bash
# Build: npm install
# Start: node server.js
# After deploy, seed DB:
# Open Render Shell → node utils/seed.js
```

### Frontend (Vercel)
```bash
# Auto-deploys on git push
# Manual: vercel --prod
```

### Local Development
```bash
# Backend
cd backend && npm run dev

# Frontend  
cd frontend && npm run dev

# Seed database
cd backend && npm run seed
```

---

## 🔐 ADMIN CREDENTIALS

**Default (change immediately after first login):**
- URL: `https://velvetcart.store/admin`
- Email: `admin@velvetcart.store`
- Password: `Admin@2025`

---

## 📊 DEFAULT COUPON CODES

| Code | Discount | Min Order | Expires |
|------|----------|-----------|---------|
| `VELVET10` | 10% (max ₹500) | ₹999 | 90 days |
| `WELCOME200` | ₹200 flat | ₹1,499 | 1 year |
| `LUXURY20` | 20% (max ₹1,500) | ₹3,999 | 30 days |

---

## 🏗 COMPLETE FILE STRUCTURE

```
velvetcart/
├── backend/
│   ├── config/
│   │   └── cloudinary.js        ✅ Multi-storage Cloudinary config
│   ├── middleware/
│   │   ├── auth.js              ✅ JWT protect + adminOnly
│   │   └── errorMiddleware.js   ✅ Global error handler + 404
│   ├── models/
│   │   ├── User.js              ✅ Auth + addresses + wishlist
│   │   ├── Product.js           ✅ Full product with variants
│   │   └── index.js             ✅ Order, Review, Coupon, QRPayment, Category, Settings
│   ├── routes/
│   │   ├── auth.js              ✅ Register/Login/Reset/Address
│   │   ├── products.js          ✅ Full CRUD + search + flash
│   │   ├── orders.js            ✅ Create/Track/Cancel/Admin
│   │   ├── payments.js          ✅ Razorpay + QR + Webhook
│   │   ├── admin.js             ✅ Dashboard + Users + Settings + CSV
│   │   ├── upload.js            ✅ Product + Banner uploads
│   │   ├── reviews.js           ✅ Create/List/Delete
│   │   ├── coupons.js           ✅ Validate coupon
│   │   ├── categories.js        ✅ List categories
│   │   └── wishlist.js          ✅ Toggle wishlist
│   ├── services/
│   │   └── emailService.js      ✅ HTML email templates
│   ├── utils/
│   │   └── seed.js              ✅ 8 products + admin + coupons
│   ├── server.js                ✅ Secured with helmet/xss/sanitize
│   ├── render.yaml              ✅ One-click Render deploy
│   └── .env.example             ✅ All variables documented
│
└── frontend/
    ├── app/
    │   ├── layout.jsx            ✅ SEO metadata + mobile nav
    │   ├── page.jsx              ✅ Homepage (ISR)
    │   ├── sitemap.js            ✅ Dynamic sitemap
    │   ├── robots.js             ✅ Bot configuration
    │   ├── products/
    │   │   ├── page.jsx          ✅ Products listing
    │   │   ├── ProductsClient.jsx ✅ Filters + search + pagination
    │   │   └── [slug]/page.jsx   ✅ Product detail (ISR + SEO)
    │   ├── cart/page.jsx         ✅ Full cart with coupon
    │   ├── checkout/
    │   │   ├── page.jsx          ✅ Razorpay + QR + COD
    │   │   └── success/page.jsx  ✅ Order confirmation
    │   ├── login/page.jsx        ✅ JWT login
    │   ├── register/page.jsx     ✅ Registration + password strength
    │   ├── forgot-password/      ✅ Email reset flow
    │   ├── reset-password/[token]/ ✅ Secure token reset
    │   ├── account/
    │   │   ├── page.jsx          ✅ Dashboard + orders + wishlist
    │   │   └── orders/[id]/page.jsx ✅ Order detail + tracking
    │   ├── admin/
    │   │   ├── layout.jsx        ✅ Admin sidebar + auth guard
    │   │   ├── page.jsx          ✅ Analytics dashboard + charts
    │   │   ├── products/page.jsx ✅ Product CRUD + image upload
    │   │   ├── orders/page.jsx   ✅ Order management + status
    │   │   ├── customers/page.jsx ✅ User management
    │   │   ├── coupons/page.jsx  ✅ Full coupon CRUD
    │   │   ├── qr-payments/page.jsx ✅ QR approval workflow
    │   │   └── settings/page.jsx ✅ Razorpay + QR + site config
    │   ├── about/page.jsx        ✅ About page
    │   ├── contact/page.jsx      ✅ Contact form
    │   └── faq/page.jsx          ✅ FAQ accordion
    ├── components/
    │   ├── common/
    │   │   ├── Navbar.jsx        ✅ Sticky + search + mobile menu
    │   │   ├── Footer.jsx        ✅ Full links + newsletter + social
    │   │   └── MobileBottomNav.jsx ✅ App-like mobile nav
    │   ├── cart/
    │   │   └── CartDrawer.jsx    ✅ Slide-in + free shipping bar
    │   ├── product/
    │   │   ├── ProductCard.jsx   ✅ Wishlist + quick add + skeleton
    │   │   ├── ProductDetail.jsx ✅ Gallery zoom + variants + tabs
    │   │   └── ReviewSection.jsx ✅ Rating dist + submit form
    │   └── home/
    │       └── Homesections.jsx  ✅ Hero + marquee + flash + testimonials
    ├── lib/
    │   └── api.js                ✅ Full typed API client
    ├── store/
    │   └── index.js              ✅ Cart + Auth + Wishlist + UI stores
    ├── tailwind.config.js        ✅ Custom luxury design tokens
    ├── next.config.js            ✅ Image domains + security headers
    ├── vercel.json               ✅ Deployment config
    └── .env.example              ✅ All variables documented
```

---

## ⚡ POST-LAUNCH WEEK 1

1. Add your real products with actual photos
2. Test complete purchase flow with live payment
3. Share on Pinterest — products are Rich Pin ready
4. Set up Google Analytics
5. Share link on social media
6. Monitor admin dashboard for first orders

---

*VelvetCart — Built for scale, ready to launch. ✦*
