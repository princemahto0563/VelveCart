# VelvetCart Deployment Quick Start

## Copy-Paste Configuration

### RENDER DEPLOYMENT

**Root Directory**: `/backend`  
**Build Command**: `npm install`  
**Start Command**: `node server.js`

**Environment Variables** (copy all):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/velvetcart?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret_here_min_32_chars
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
FROM_EMAIL=noreply@velvetcart.store
FROM_NAME=VelvetCart
FRONTEND_URL=https://velvetcart.store
ADMIN_EMAIL=admin@velvetcart.store
ADMIN_PASSWORD=your_secure_admin_password
NODE_ENV=production
PORT=3001
MAX_FILE_SIZE=10485760
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=300
```

---

### VERCEL DEPLOYMENT

**Root Directory**: `/frontend`  
**Build Command**: `npm run build`  
**Output Directory**: `.next`

**Environment Variables** (copy all):
```
NEXT_PUBLIC_API_URL=https://velvetcart-api.onrender.com
NEXT_PUBLIC_SITE_URL=https://velvetcart.store
NEXT_PUBLIC_RAZORPAY_KEY=your_razorpay_public_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_google_verification_code
```

---

## Verification URLs

After deployment:

**Backend Health**: `https://velvetcart-api.onrender.com/api/health`  
**Frontend Home**: `https://velvetcart.store`

---

## Pre-Deployment Requirements

- [ ] MongoDB Atlas: Get connection string
- [ ] Razorpay: Get public + secret keys
- [ ] Cloudinary: Get cloud name + keys
- [ ] Gmail: Generate App Password (2FA required)
- [ ] Google OAuth: Get client ID
- [ ] Domain: Register velvetcart.store

---

## Deployment Order

1. Deploy Render backend first
2. Get Render URL: `https://velvetcart-api.onrender.com`
3. Deploy Vercel frontend with Render URL as `NEXT_PUBLIC_API_URL`
4. Add DNS CNAME for domain
5. Configure Razorpay webhook

---

## Post-Deployment

- [ ] Test `/api/health` endpoint
- [ ] Test homepage loads
- [ ] Test product page loads
- [ ] Test checkout flow
- [ ] Test admin login
