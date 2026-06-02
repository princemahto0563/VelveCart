# Render Deployment Configuration - VelvetCart Backend

## Service Setup

### Basic Configuration
- **Service Name**: `velvetcart-api`
- **Environment**: `Node`
- **Region**: `Singapore` (or nearest to your users)
- **Plan**: `Standard` (minimum for production)

### Build & Deploy
- **Root Directory**: `/backend`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Node Version**: `18.17.0` or later

### Environment Variables

Copy and paste these exactly into Render dashboard. Replace placeholder values with real credentials:

```
# Database
MONGODB_URI=your_mongodb_atlas_connection_string_here

# JWT
JWT_SECRET=your_secure_jwt_secret_here_min_32_chars
JWT_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
FROM_EMAIL=noreply@velvetcart.store
FROM_NAME=VelvetCart

# Frontend Configuration
FRONTEND_URL=https://velvetcart.store

# Admin & Security
ADMIN_EMAIL=admin@velvetcart.store
ADMIN_PASSWORD=your_secure_admin_password

# Node Environment
NODE_ENV=production
PORT=3001

# Other Settings
MAX_FILE_SIZE=10485760
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=300
```

### Important Notes

1. **MongoDB Atlas Connection String**: Format should be:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/velvetcart?retryWrites=true&w=majority
   ```

2. **Gmail App Password**: 
   - Enable 2FA on your Google Account
   - Create App Password for Gmail: https://myaccount.google.com/apppasswords
   - Use the 16-character password provided

3. **Razorpay Keys**: Get from https://dashboard.razorpay.com/app/keys

4. **Cloudinary Credentials**: Get from https://cloudinary.com/console

### Deployment Steps

1. **Create New Web Service**
   - Click "Create +" → "Web Service"
   - Connect your GitHub repository
   - Select `/backend` as root directory

2. **Configure Build & Start Commands**
   - Build: `npm install`
   - Start: `node server.js`

3. **Add Environment Variables**
   - Add all variables from the list above
   - Click "Deploy"

4. **Post-Deployment Verification**
   - Check health endpoint: `https://your-render-url/api/health`
   - Should return: `{ "status": "OK" }`

5. **Domain Setup** (if using custom domain)
   - Add CNAME record pointing to Render service URL
   - Update FRONTEND_URL in environment variables

### Monitoring & Maintenance

- **Logs**: View in Render dashboard → Logs tab
- **Monitoring**: Enable notifications for failed deployments
- **Auto-Deploy**: Enable GitHub integration for automatic deploys on push
- **Health Checks**: Render automatically checks `/api/health` endpoint

### Troubleshooting

**MongoDB Connection Failed**:
- Verify IP whitelist in MongoDB Atlas includes Render IP
- Check connection string format and credentials

**Build Fails**:
- Check `npm install` output in logs
- Verify all required system dependencies are available

**Server Crashes**:
- Check environment variables are all set correctly
- Verify MongoDB connection string
- Review error logs in Render dashboard

### Important: After Deployment

1. Update `FRONTEND_URL` with actual Render URL once assigned
2. Share Render URL with Vercel frontend for `NEXT_PUBLIC_API_URL`
3. Configure Razorpay webhook to point to: `https://your-render-url/api/payments/webhook`
