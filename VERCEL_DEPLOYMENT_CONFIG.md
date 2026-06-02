# Vercel Deployment Configuration - VelvetCart Frontend

## Project Setup

### Basic Configuration
- **Project Name**: `velvetcart-store` (or similar)
- **Framework**: `Next.js`
- **Root Directory**: `/frontend`
- **Node Version**: `18.17.0` or later

### Build & Deploy
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install` (default)

### Environment Variables

Copy and paste these exactly into Vercel dashboard. Update with actual values:

```
# API Configuration
NEXT_PUBLIC_API_URL=https://velvetcart-api.onrender.com
NEXT_PUBLIC_SITE_URL=https://velvetcart.store

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY=your_razorpay_public_key

# Google
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_google_verification_code
```

### Deployment Steps

1. **Create New Project**
   - Visit vercel.com/new
   - Import your GitHub repository
   - Select `/frontend` as Root Directory

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Add Environment Variables**
   - Go to Settings → Environment Variables
   - Add all variables from the list above
   - Production environment only

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Verify 28 pages compiled: "✓ Compiled successfully"

5. **Custom Domain**
   - Go to Settings → Domains
   - Add domain: `velvetcart.store`
   - Update DNS records (CNAME/A records as instructed)
   - SSL certificate auto-provisioned by Vercel

### Important Configuration Values

#### NEXT_PUBLIC_API_URL
- **Local Development**: `http://localhost:3001`
- **Production**: `https://velvetcart-api.onrender.com` (or your Render URL)

#### NEXT_PUBLIC_SITE_URL
- **Production**: `https://velvetcart.store`
- Must include protocol (https://)

#### Razorpay Keys
- Get from https://dashboard.razorpay.com/app/keys
- `NEXT_PUBLIC_RAZORPAY_KEY` is the public key (safe to expose)
- Backend has the secret key (RAZORPAY_KEY_SECRET)

#### Google Integration
- Create OAuth 2.0 credentials at https://console.cloud.google.com
- Authorized redirect URI: `https://velvetcart.store/api/auth/google/callback`

### Deployment Verification

After deployment, verify:

```bash
# Check frontend build
curl https://velvetcart.store
# Should return homepage HTML

# Check API connectivity
curl https://velvetcart.store/api/products
# Should return products from backend
```

### Analytics & Monitoring

1. **Web Vitals**: Vercel automatically tracks Core Web Vitals
2. **Function Invocations**: Monitor in Vercel dashboard
3. **Edge Functions**: View logs in dashboard
4. **Error Tracking**: Configure Sentry integration

### Optimization Tips

1. **Image Optimization**: Next.js Image component auto-optimizes
2. **Compression**: Vercel applies gzip/brotli automatically
3. **Caching**: Configure in vercel.json (already configured)
4. **Edge Caching**: ISR pages cached globally via CDN

### Troubleshooting

**Build Fails**:
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Run `npm run build` locally to test

**API Connection Issues**:
- Verify NEXT_PUBLIC_API_URL is correct
- Check backend is running on Render
- Verify CORS is enabled on backend

**Images Not Loading**:
- Verify Cloudinary credentials in backend
- Check image URLs in API responses
- Test image URL directly in browser

### Important: Before Going Live

1. ✓ Update NEXT_PUBLIC_API_URL to actual Render backend URL
2. ✓ Update NEXT_PUBLIC_SITE_URL to custom domain
3. ✓ Configure custom domain in Vercel settings
4. ✓ Add DNS CNAME record to point to Vercel
5. ✓ Wait 24-48 hours for DNS propagation
6. ✓ Test all payment flows with Razorpay test keys first
7. ✓ Verify emails send correctly
8. ✓ Test checkout flow end-to-end

### Post-Deployment

- Monitor error logs daily
- Set up email alerts for deployment failures
- Configure Slack notifications
- Perform user acceptance testing
- Monitor performance metrics
