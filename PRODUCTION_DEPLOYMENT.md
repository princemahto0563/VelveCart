# VelvetCart - Production Deployment Guide

## Overview
This guide provides complete instructions for deploying VelvetCart (frontend on Vercel, backend on Render) to production.

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository with the VelvetCart code
- All environment variables configured

### Environment Variables (Frontend - Vercel)
```
NEXT_PUBLIC_API_URL=https://velvetcart-api.onrender.com
NEXT_PUBLIC_SITE_URL=https://velvetcart.store
NEXT_PUBLIC_RAZORPAY_KEY=rzp_live_xxxxxxxxxxxx
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_google_site_verification_code
```

### Deployment Steps
1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import the GitHub repository
4. Set Framework Preset to "Next.js"
5. Add Environment Variables in Vercel Dashboard
6. Click "Deploy"
7. Configure domain: `velvetcart.store` → Vercel domain

### Build Command
```bash
npm run build
```

### Start Command
```bash
npm start
```

### Expected Build Output
- All pages compile successfully
- No TypeScript errors
- No ESLint warnings (unless ignored)
- First Load JS: ~178 kB
- Total routes: 28 pages

---

## Backend Deployment (Render)

### Prerequisites
- Render account (https://render.com)
- All environment variables configured
- MongoDB Atlas cluster (URI)

### Environment Variables (Backend - Render)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=VelvetCart
JWT_SECRET=your_super_secure_jwt_secret
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hello@velvetcart.store
SMTP_PASS=your_app_password
FROM_EMAIL=hello@velvetcart.store
FROM_NAME=VelvetCart
FRONTEND_URL=https://velvetcart.store
ADMIN_EMAIL=admin@velvetcart.store
ADMIN_PASSWORD=your_secure_password
```

### Deployment Steps
1. Go to https://render.com
2. Create new "Web Service"
3. Connect GitHub repository
4. Set configuration:
   - **Name**: velvetcart-api
   - **Environment**: Node
   - **Region**: Singapore
   - **Plan**: Starter (or higher)
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add all Environment Variables
6. Click "Create Web Service"
7. Render will auto-deploy and provide URL (e.g., https://velvetcart-api.onrender.com)

### Health Check
The backend provides a health check endpoint:
```
GET https://velvetcart-api.onrender.com/api/health
```

Response:
```json
{
  "success": true,
  "message": "VelvetCart API ✦",
  "env": "production",
  "ts": "2026-06-02T...",
  "db": "✓ Connected"
}
```

---

## Required Services

### 1. MongoDB Atlas
- **Purpose**: Database
- **Setup**: 
  - Create cluster at https://www.mongodb.com/cloud/atlas
  - Create user with username and password
  - Get connection string
  - Whitelist Render IP: `0.0.0.0/0` (or specific Render IP)
- **Connection String Format**:
  ```
  mongodb+srv://username:password@cluster.mongodb.net/?appName=VelvetCart
  ```

### 2. Cloudinary
- **Purpose**: Image storage and optimization
- **Setup**:
  - Create account at https://cloudinary.com
  - Go to Settings → API Keys
  - Copy: Cloud Name, API Key, API Secret
- **Usage**: Product images, QR payment screenshots, banners

### 3. Razorpay
- **Purpose**: Payment processing
- **Setup**:
  - Create account at https://dashboard.razorpay.com
  - Create API Keys (Live mode)
  - Copy: Key ID, Key Secret
- **Features**: Online payments, UPI, Cards, Net Banking, Wallets

### 4. Gmail (SMTP)
- **Purpose**: Email notifications
- **Setup**:
  - Enable 2-Factor Authentication on Gmail account
  - Generate App Password (not regular Gmail password)
  - Use app password in SMTP_PASS
- **Emails**: Order confirmations, password resets, notifications

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Products
- `GET /api/products` - List all (filters: category, sort, price, search)
- `GET /api/products/:slug` - Get single product
- `GET /api/products/featured` - Featured products
- `GET /api/products/flash-sale` - Flash sale items
- `POST /api/products` - Create (admin only)
- `PUT /api/products/:id` - Update (admin only)
- `DELETE /api/products/:id` - Delete (admin only)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my` - User's orders
- `GET /api/orders/:id` - Order details
- `GET /api/orders` - All orders (admin only)
- `PUT /api/orders/:id/status` - Update status (admin only)

### Payments
- `POST /api/payments/razorpay/order` - Create Razorpay order
- `POST /api/payments/razorpay/verify` - Verify payment
- `POST /api/payments/qr/upload` - Upload QR screenshot
- `GET /api/payments/qr/pending` - Pending QR payments (admin)
- `PUT /api/payments/qr/:id/approve` - Approve QR (admin)
- `PUT /api/payments/qr/:id/reject` - Reject QR (admin)

### Categories
- `GET /api/categories` - List categories
- `GET /api/categories/:slug` - Category details

### Reviews
- `GET /api/reviews/product/:productId` - Product reviews
- `POST /api/reviews` - Create review
- `DELETE /api/reviews/:id` - Delete review

### Wishlist
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist/:productId` - Toggle wishlist item

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List users (admin only)
- `GET /api/admin/coupons` - List coupons (admin only)
- `POST /api/admin/coupons` - Create coupon (admin only)
- `PUT /api/admin/coupons/:id` - Update coupon (admin only)
- `DELETE /api/admin/coupons/:id` - Delete coupon (admin only)
- `POST /api/admin/categories` - Create category (admin only)
- `PUT /api/admin/categories/:id` - Update category (admin only)
- `DELETE /api/admin/categories/:id` - Delete category (admin only)

---

## Frontend Routes

### Public Routes
- `/` - Homepage
- `/products` - Products page
- `/products/[slug]` - Product detail
- `/login` - Login page
- `/register` - Register page
- `/forgot-password` - Forgot password
- `/reset-password/[token]` - Reset password
- `/about` - About page
- `/contact` - Contact page
- `/faq` - FAQ page
- `/privacy` - Privacy policy
- `/terms` - Terms of service

### Authenticated Routes
- `/account` - User account
- `/account/orders` - Order history
- `/account/orders/[id]` - Order details
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/checkout/success` - Order success

### Admin Routes
- `/admin` - Dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/customers` - Customer management
- `/admin/coupons` - Coupon management
- `/admin/qr-payments` - QR payment verification
- `/admin/analytics` - Analytics
- `/admin/settings` - Settings

---

## Database Models

### User
```javascript
{
  name, email, password, phone,
  avatar, role (user/admin),
  isVerified, googleId,
  addresses: [{ fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault }],
  wishlist: [productIds],
  resetPasswordToken, resetPasswordExpire,
  timestamps
}
```

### Product
```javascript
{
  name, slug, brand, description, shortDescription,
  category, price, originalPrice, discount,
  images: [{ url, publicId, alt }],
  variants: [{ size, color, colorHex, stock, sku }],
  specifications, stock, sku, tags,
  isFeatured, isFlashSale, flashSaleEndsAt, flashSalePrice,
  isActive, rating: { average, count },
  metaTitle, metaDescription,
  views, salesCount,
  timestamps
}
```

### Order
```javascript
{
  orderId, user, items: [{ product, name, image, price, quantity, variant }],
  shippingAddress,
  itemsPrice, shippingPrice, taxPrice, discountAmount, totalPrice,
  coupon, paymentMethod (razorpay/qr/cod),
  paymentStatus (pending/paid/failed/refunded),
  razorpayOrderId, razorpayPaymentId, razorpaySignature,
  qrPayment, status (pending/confirmed/processing/shipped/delivered/cancelled/refunded),
  trackingNumber, trackingUrl, notes,
  deliveredAt, cancelledAt, cancelReason,
  timestamps
}
```

### Other Models
- Category, Review, Coupon, QRPayment, Settings

---

## Performance Optimization

### Frontend
- ISR (Incremental Static Regeneration): 300s revalidation
- Image optimization via Cloudinary
- Code splitting and lazy loading
- Compression and minification via Next.js

### Backend
- Request rate limiting: 300 req/15min (general), 25 req/15min (auth)
- Database indexing on frequently queried fields
- Lean queries for better performance
- Caching via browser headers

---

## Security Measures

### Authentication
- JWT tokens with 30-day expiration
- bcrypt password hashing
- CORS enabled for trusted origins

### Input Validation
- express-validator for request validation
- express-mongo-sanitize for NoSQL injection prevention
- xss-clean for XSS prevention

### Headers
- Helmet.js security headers
- CSP disabled (for flexibility with images/external resources)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff

### Rate Limiting
- General: 300 requests per 15 minutes
- Auth endpoints: 25 requests per 15 minutes

---

## Monitoring & Logs

### Vercel
- Monitor builds and deployments in Vercel Dashboard
- View logs: Vercel Dashboard → Function Logs
- Performance metrics available in Analytics

### Render
- Health check endpoint: `/api/health`
- Logs available in Render Dashboard
- Auto-restart on crashes

---

## Troubleshooting

### Frontend Build Fails
- Check Node version: `node -v` (requires >= 14)
- Clear cache: `rm -rf .next node_modules && npm install`
- Check environment variables in Vercel Dashboard

### Backend Connection Issues
- Verify MongoDB connection string
- Whitelist Render IP in MongoDB Atlas
- Check environment variables are set

### Email Not Sending
- Enable "Less secure app access" or use App Password
- Check Gmail credentials in environment variables
- Verify SMTP settings

### Images Not Loading
- Check Cloudinary credentials
- Verify image URLs in database
- Check Cloudinary folder structure

### Payment Issues
- Verify Razorpay credentials (test vs live mode)
- Check webhook URL configuration
- Review payment logs in Razorpay Dashboard

---

## Backup & Maintenance

### Regular Tasks
1. Backup MongoDB database weekly
2. Monitor API performance and error rates
3. Review server logs for anomalies
4. Update dependencies monthly
5. Test payment integrations quarterly

### Disaster Recovery
- MongoDB Atlas automatic backups (check retention policy)
- Code backup via GitHub
- Database export before major updates

---

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Express.js Docs**: https://expressjs.com
- **Mongoose Docs**: https://mongoosejs.com
- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Razorpay Docs**: https://razorpay.com/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation

---

## Version Information

- **Next.js**: 14.2.3
- **React**: 18.3.1
- **Express.js**: 4.19.2
- **MongoDB/Mongoose**: 8.4.1
- **Node.js**: >= 18.0.0
- **Deployment Date**: June 2, 2026

---

Generated: 2026-06-02
Status: Production Ready ✓
