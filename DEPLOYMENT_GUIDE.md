# Find-A-Hand Deployment Guide

## Current Issues with Netlify Deployment

### 1. **Backend API Not Deployed**
- Your backend (Node.js/Express) is not deployed to Netlify
- Netlify only hosts static files (HTML, CSS, JS)
- Your frontend is trying to call `http://localhost:5000` which won't work in production

### 2. **API URL Configuration**
- Frontend config.js is hardcoded to localhost
- Need to update to production backend URL

### 3. **Missing Backend Deployment**
- Need to deploy backend to a platform like Railway, Render, or Heroku
- Frontend needs to point to the deployed backend URL

## Solution Steps

### Step 1: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy Backend**
   ```bash
   # In your project directory
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

3. **Connect to Railway**
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect Node.js

4. **Set Environment Variables**
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add these variables:
     ```
     MONGO_URI=mongodb+srv://mbah18791:Mamad12.@find-a-hand-cluster.xqcvlkv.mongodb.net/find-a-hand?retryWrites=true&w=majority&appName=find-a-hand-cluster
     JWT_SECRET=find-a-hand-super-secret-jwt-key-2024-production
     NODE_ENV=production
     PORT=5000
     ```

5. **Get Railway URL**
   - After deployment, Railway will give you a URL like: `https://your-app-name.railway.app`
   - Copy this URL

### Step 2: Update Frontend Configuration

1. **Update config.js**
   ```javascript
   // In frontend/views/config.js
   const CONFIG = {
     API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
       ? 'http://localhost:5000' 
       : 'https://your-app-name.railway.app', // Replace with your Railway URL
     // ... rest of config
   };
   ```

2. **Update all API calls**
   - Make sure all fetch calls use the CONFIG.API_BASE_URL
   - Check these files:
     - `frontend/views/index.js`
     - `frontend/views/handyman-profile.js`
     - `frontend/views/search-handyman.js`
     - All other JS files with API calls

### Step 3: Deploy Frontend to Netlify

1. **Push Updated Code**
   ```bash
   git add .
   git commit -m "Update API URLs for production"
   git push origin main
   ```

2. **Deploy to Netlify**
   - Go to https://netlify.com
   - Sign up with GitHub
   - Click "New site from Git"
   - Select your repository
   - Set build settings:
     - Build command: (leave empty)
     - Publish directory: `frontend/views`

3. **Set Environment Variables**
   - In Netlify dashboard, go to Site settings
   - Click "Environment variables"
   - Add any frontend-specific variables if needed

### Step 4: Test Deployment

1. **Test Backend API**
   - Visit your Railway URL + `/health`
   - Should return health status

2. **Test Frontend**
   - Visit your Netlify URL
   - Check browser console for errors
   - Test all features

## Common Issues & Fixes

### Issue 1: CORS Errors
**Solution**: Update CORS in backend
```javascript
// In app.js
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://your-netlify-app.netlify.app', // Add your Netlify URL
  'https://your-railway-app.railway.app'
];
```

### Issue 2: API Calls Failing
**Solution**: Check network tab in browser
- Look for failed requests
- Verify API URLs are correct
- Check if Railway app is running

### Issue 3: Static Files Not Loading
**Solution**: Verify Netlify publish directory
- Should be `frontend/views`
- All assets should be in `frontend/public`

### Issue 4: Database Connection
**Solution**: Check Railway logs
- Go to Railway dashboard
- Check "Deployments" tab
- Look for connection errors

## Final Checklist

- [ ] Backend deployed to Railway
- [ ] Railway URL obtained
- [ ] Frontend config.js updated with Railway URL
- [ ] All API calls use CONFIG.API_BASE_URL
- [ ] Frontend deployed to Netlify
- [ ] CORS configured for Netlify domain
- [ ] Database connected and working
- [ ] All features tested

## Quick Test Commands

```bash
# Test backend locally
curl http://localhost:5000/health

# Test backend on Railway (replace URL)
curl https://your-app-name.railway.app/health

# Test API endpoints
curl https://your-app-name.railway.app/api/handymen
```

## Support

If you encounter issues:
1. Check Railway logs for backend errors
2. Check Netlify logs for build errors
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly 