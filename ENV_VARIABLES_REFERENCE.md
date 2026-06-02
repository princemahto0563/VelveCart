# VelvetCart - Environment Variables Reference

## Backend Environment Variables (.env on Render)

### Server Configuration
```
NODE_ENV=production
PORT=5000
```

### Database (MongoDB Atlas)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=VelvetCart
```
**How to get**:
1. Go to https://www.mongodb.com/cloud/atlas
2. Create/select cluster
3. Click "Connect" → "Drivers"
4. Copy connection string
5. Replace `<username>` and `<password>` with actual credentials

### Authentication (JWT)
```
JWT_SECRET=your_super_secure_random_string_min_32_chars
JWT_EXPIRE=30d
```
**How to generate JWT_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Image Storage (Cloudinary)
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
**How to get**:
1. Go to https://cloudinary.com
2. Sign up/Login
3. Dashboard → Settings → API Keys
4. Copy the three values

### Payment Gateway (Razorpay)
```
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```
**How to get**:
1. Go to https://dashboard.razorpay.com
2. Settings → API Keys
3. Make sure you're in "Live Mode"
4. Copy Key ID and Key Secret

### Email Service (Gmail SMTP)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hello@velvetcart.store
SMTP_PASS=your_app_password
FROM_EMAIL=hello@velvetcart.store
FROM_NAME=VelvetCart
```
**How to get Gmail App Password**:
1. Go to https://myaccount.google.com
2. Security → 2-Step Verification (enable if not)
3. Security → App passwords
4. Select Mail → Windows Computer (or your device)
5. Copy the generated password
6. Use this as SMTP_PASS (NOT your regular Gmail password)

### Frontend URL (for CORS and email links)
```
FRONTEND_URL=https://velvetcart.store
```

### Admin Credentials (for initial setup)
```
ADMIN_EMAIL=admin@velvetcart.store
ADMIN_PASSWORD=your_secure_password
```
**Note**: Update these after first login

---

## Frontend Environment Variables (.env.production on Vercel)

### API Endpoint
```
NEXT_PUBLIC_API_URL=https://velvetcart-api.onrender.com
```
**Note**: This should point to your Render backend URL

### Site URL
```
NEXT_PUBLIC_SITE_URL=https://velvetcart.store
```

### Payment (Razorpay - Public Key Only)
```
NEXT_PUBLIC_RAZORPAY_KEY=rzp_live_xxxxxxxxxxxx
```
**Warning**: Use LIVE mode key for production, TEST mode for development
**Note**: This is the public key - safe to expose

### Google Integration
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_google_site_verification_code
```
**How to get**:
1. Go to https://console.cloud.google.com
2. Create project
3. Enable OAuth 2.0
4. Create OAuth 2.0 Client ID
5. Set authorized redirect URIs to `https://velvetcart.store`

---

## Local Development Environment Variables

### Backend (.env.local)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=VelvetCart
JWT_SECRET=dev_secret_key_minimum_32_characters_long
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hello@velvetcart.store
SMTP_PASS=your_app_password
FROM_EMAIL=hello@velvetcart.store
FROM_NAME=VelvetCart
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@velvetcart.store
ADMIN_PASSWORD=Admin@VelvetCart2025
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_xxxxxxxxxxxx
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_test_google_client_id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=test_verification_code
```

---

## Environment Variable Checklist

### Before Deploying to Render
- [ ] MONGODB_URI is set and whitelist includes Render IP
- [ ] JWT_SECRET is a secure random string (min 32 chars)
- [ ] Cloudinary credentials are valid
- [ ] Razorpay credentials are LIVE mode (not test)
- [ ] Gmail SMTP password is set (use App Password, not Gmail password)
- [ ] FRONTEND_URL is set to production domain
- [ ] ADMIN_EMAIL and ADMIN_PASSWORD are secure

### Before Deploying to Vercel
- [ ] NEXT_PUBLIC_API_URL points to correct Render backend
- [ ] NEXT_PUBLIC_SITE_URL is set to production domain
- [ ] NEXT_PUBLIC_RAZORPAY_KEY is LIVE mode key (not test)
- [ ] Google OAuth credentials are configured
- [ ] All environment variables are added in Vercel Dashboard

---

## Security Best Practices

### DO
✓ Use strong, random secrets (min 32 characters)
✓ Store secrets in environment variables, never in code
✓ Use Live mode for Razorpay in production
✓ Use App Passwords for Gmail (not regular password)
✓ Rotate secrets periodically
✓ Use different secrets for dev/staging/production
✓ Whitelist only necessary IPs in MongoDB

### DON'T
✗ Commit .env files to Git
✗ Share environment variables in chat/emails
✗ Use the same secrets for multiple environments
✗ Use test keys in production
✗ Use weak or predictable passwords
✗ Expose API keys in frontend code (except public keys)
✗ Log or log sensitive environment variables

---

## Testing Environment Variables

### Verify Backend
```bash
# Test MongoDB connection
npm run dev  # or node server.js

# Expected: ✓ MongoDB: cluster-name.mongodb.net
# Check health endpoint: GET http://localhost:5000/api/health
```

### Verify Frontend
```bash
# Build and check
npm run build

# Expected: ✓ Compiled successfully
# Check API URL: echo $NEXT_PUBLIC_API_URL
```

### Verify Services

**Cloudinary**:
```bash
curl -X POST \
  https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/ping \
  -u YOUR_API_KEY:YOUR_API_SECRET
```

**Razorpay**:
```bash
curl -X GET https://api.razorpay.com/v1/payments \
  -u RAZORPAY_KEY_ID:RAZORPAY_KEY_SECRET
```

**MongoDB**:
```bash
# Test connection string in MongoDB Atlas shell
```

---

## Troubleshooting

### MongoDB Connection Failed
**Error**: `The \`uri\` parameter to \`openUri()\` must be a string`
**Solution**: Ensure MONGODB_URI is set as a string

**Error**: `MongooseError: Cannot connect`
**Solutions**:
- Check MongoDB URI is correct
- Whitelist Render IP in MongoDB Network Access
- Verify username and password are URL-encoded if they contain special characters

### Cloudinary Upload Fails
**Error**: `Unauthorized`
**Solutions**:
- Verify credentials are correct
- Check API Key and Secret (not Cloud Name)
- Ensure image files are under size limit (5-10MB)

### Email Not Sending
**Error**: `SMTP connection error`
**Solutions**:
- Use Gmail App Password, not regular password
- Enable "Less secure app access" if using regular password
- Check SMTP_USER email address is correct
- Verify SMTP_HOST and SMTP_PORT (587 for TLS)

### Razorpay Payment Fails
**Error**: `Invalid key_id`
**Solutions**:
- Use LIVE keys in production (not TEST keys)
- Verify keys are from https://dashboard.razorpay.com (not mock)
- Check webhook URL is configured
- Review Razorpay logs at https://dashboard.razorpay.com

---

## Version Control

**Never commit**:
- `.env` files
- `.env.local` files
- `.env.*.local` files
- Files containing API keys or secrets

**Use `.gitignore`**:
```
.env
.env.local
.env.*.local
node_modules/
.next/
dist/
```

---

Last Updated: June 2, 2026
Status: Ready for Production
