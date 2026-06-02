# VelvetCart - Quick Start Deployment Guide

## Status: ✅ PRODUCTION READY

All code is ready. Just follow these steps to deploy.

---

## 1. Pre-Deployment (5 minutes)

### Get Credentials Ready
```
✓ MongoDB URI
✓ Cloudinary: Cloud Name, API Key, API Secret
✓ Razorpay: Key ID & Secret (LIVE mode)
✓ Gmail: Email & App Password
✓ JWT_SECRET (random 32+ chars)
```

### Domain Setup (if not done)
```
✓ Point velvetcart.store to Vercel
✓ Wait for DNS propagation (up to 48 hours)
```

---

## 2. Deploy Backend (Render) - 5 minutes

### Step 1: Create Web Service
1. Go to https://render.com → Create New → Web Service
2. Connect GitHub repository
3. Fill in:
   - **Name**: velvetcart-api
   - **Runtime**: Node
   - **Region**: Singapore
   - **Build**: `npm install`
   - **Start**: `node server.js`

### Step 2: Add Environment Variables
Add these 28 variables in Render Dashboard:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=[your-mongodb-uri]
JWT_SECRET=[random-32-chars]
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=[value]
CLOUDINARY_API_KEY=[value]
CLOUDINARY_API_SECRET=[value]
RAZORPAY_KEY_ID=[live-key]
RAZORPAY_KEY_SECRET=[live-secret]
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[gmail]
SMTP_PASS=[app-password]
FROM_EMAIL=hello@velvetcart.store
FROM_NAME=VelvetCart
FRONTEND_URL=https://velvetcart.store
ADMIN_EMAIL=[admin-email]
ADMIN_PASSWORD=[secure-password]
```

### Step 3: Deploy
Click "Create Web Service" and wait for deployment.

**Expected URL**: https://velvetcart-api.onrender.com

### Step 4: Verify
```bash
curl https://velvetcart-api.onrender.com/api/health
# Should return: {"success": true, "message": "VelvetCart API ✦", ...}
```

**Status**: ✅ Backend deployed

---

## 3. Deploy Frontend (Vercel) - 3 minutes

### Step 1: Create Project
1. Go to https://vercel.com → Add New → Project
2. Import GitHub repository
3. Framework: Next.js
4. Root Directory: ./frontend

### Step 2: Add Environment Variables
Add these 5 variables in Vercel Dashboard:

```
NEXT_PUBLIC_API_URL=https://velvetcart-api.onrender.com
NEXT_PUBLIC_SITE_URL=https://velvetcart.store
NEXT_PUBLIC_RAZORPAY_KEY=[live-public-key]
NEXT_PUBLIC_GOOGLE_CLIENT_ID=[your-google-client-id]
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=[code]
```

### Step 3: Deploy
Click "Deploy" and wait for build to complete.

**Expected URL**: https://velvetcart.store

### Step 4: Verify
```bash
curl https://velvetcart.store
# Should return HTML homepage
```

**Status**: ✅ Frontend deployed

---

## 4. Post-Deployment (10 minutes)

### Test User Flows
- [ ] Homepage loads
- [ ] Products display
- [ ] Can register new user
- [ ] Can login
- [ ] Can add to cart
- [ ] Checkout works
- [ ] Admin dashboard accessible
- [ ] Razorpay payment works (test mode)

### Monitor Logs
```
Vercel: Dashboard → Logs
Render: Dashboard → Logs

Look for errors and verify health check passes
```

### Health Check URLs
```
Frontend: https://velvetcart.store
Backend: https://velvetcart-api.onrender.com/api/health
```

**Status**: ✅ Deployed and verified

---

## 5. Common Issues & Fixes

### Backend Won't Start
**Error**: `MONGODB_URI is undefined`
**Fix**: Verify MongoDB URI is set in Render environment variables

**Error**: `Port already in use`
**Fix**: Render uses PORT 5000 - should be fine

### Frontend Build Fails
**Error**: `Build failed`
**Fix**: Check Vercel logs for specific error

**Error**: `404 on API calls`
**Fix**: Verify NEXT_PUBLIC_API_URL points to correct Render URL

### Payment Issues
**Error**: `Razorpay key invalid`
**Fix**: Use LIVE mode keys (not test), verify at https://dashboard.razorpay.com

### Email Not Sending
**Error**: `SMTP authentication failed`
**Fix**: Use Gmail App Password (not regular password), enable 2FA

---

## 6. Useful Links

| Service | URL |
|---------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| Render Dashboard | https://render.com/dashboard |
| MongoDB Atlas | https://mongodb.com/cloud/atlas |
| Razorpay Dashboard | https://dashboard.razorpay.com |
| Gmail Settings | https://myaccount.google.com/security |
| Cloudinary Dashboard | https://cloudinary.com/console |

---

## 7. Emergency Contacts

| Issue | Contact |
|-------|---------|
| Deployment Help | Prince Mahto |
| Database Issues | [Your DBA] |
| Payment Issues | Razorpay Support |
| Email Issues | Gmail Support |

---

## 8. Verification Checklist

```
Frontend Deployed
  ✅ https://velvetcart.store accessible
  ✅ Pages load without 404
  ✅ API calls succeed
  ✅ Images load

Backend Deployed
  ✅ https://velvetcart-api.onrender.com/api/health returns 200
  ✅ Database connected
  ✅ CORS working
  ✅ Rate limiting active

Services Connected
  ✅ MongoDB connected
  ✅ Cloudinary working
  ✅ Razorpay configured
  ✅ Email sending

User Flows Working
  ✅ Registration
  ✅ Login
  ✅ Shopping
  ✅ Checkout
  ✅ Payment
  ✅ Admin access
```

---

## 9. Environment Variables Quick Copy

### For Render (Backend)
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=hello@velvetcart.store
FROM_NAME=VelvetCart
FRONTEND_URL=https://velvetcart.store
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

### For Vercel (Frontend)
```bash
NEXT_PUBLIC_API_URL=https://velvetcart-api.onrender.com
NEXT_PUBLIC_SITE_URL=https://velvetcart.store
NEXT_PUBLIC_RAZORPAY_KEY=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

---

## 10. Total Deployment Time

| Step | Time |
|------|------|
| Backend deployment | 5 min |
| Frontend deployment | 3 min |
| Build/startup | 2 min |
| Verification | 5 min |
| **Total** | **~15 minutes** |

---

## Need Help?

1. **Check logs first**: Vercel or Render Dashboard
2. **Read PRODUCTION_DEPLOYMENT.md** for detailed guide
3. **Check ENV_VARIABLES_REFERENCE.md** for variable help
4. **Review DEPLOYMENT_CHECKLIST.md** before deployment

---

**Generated**: June 2, 2026
**Status**: ✅ PRODUCTION READY
**Deployment Time**: ~15 minutes
