# 🚀 Deployment Guide - Find-A-Hand

This guide will help you deploy the Find-A-Hand application to production with backend on Railway/Render and frontend on Netlify/Vercel.

## 📋 Prerequisites

- GitHub repository: [https://github.com/Mamadou8bah/find-a-hand](https://github.com/Mamadou8bah/find-a-hand)
- MongoDB Atlas account (for production database)
- Railway/Render account (for backend)
- Netlify/Vercel account (for frontend)

## 🔧 Backend Deployment

### Option 1: Railway Deployment

1. **Sign up for Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `find-a-hand` repository

3. **Configure Environment Variables**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/find-a-hand
   JWT_SECRET=your-super-secret-jwt-key-for-production
   NODE_ENV=production
   PORT=5000
   ```

4. **Deploy**
   - Railway will automatically detect the Node.js app
   - It will use the `Procfile` for deployment
   - Your backend will be available at: `https://your-app-name.railway.app`

### Option 2: Render Deployment

1. **Sign up for Render**
   - Go to [render.com](https://render.com)
   - Sign up with your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `find-a-hand` repository

3. **Configure Service**
   - **Name**: `find-a-hand-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

4. **Add Environment Variables**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/find-a-hand
   JWT_SECRET=your-super-secret-jwt-key-for-production
   NODE_ENV=production
   PORT=10000
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your app
   - Your backend will be available at: `https://your-app-name.onrender.com`

## 🌐 Frontend Deployment

### Option 1: Netlify Deployment

1. **Sign up for Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with your GitHub account

2. **Deploy from Git**
   - Click "New site from Git"
   - Choose GitHub and select your repository

3. **Configure Build Settings**
   - **Base directory**: Leave empty (root)
   - **Build command**: Leave empty (no build needed)
   - **Publish directory**: `frontend/views`

4. **Configure Environment Variables**
   - Go to Site settings → Environment variables
   - Add: `REACT_APP_API_URL=https://your-backend-url.com`

5. **Update API URL**
   - Edit `frontend/views/config.js`
   - Update `API_BASE_URL` to your backend URL

6. **Deploy**
   - Netlify will deploy your frontend
   - Your site will be available at: `https://your-site-name.netlify.app`

### Option 2: Vercel Deployment

1. **Sign up for Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Project**
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: Leave empty
   - **Output Directory**: `frontend/views`

4. **Add Environment Variables**
   - Go to Project settings → Environment Variables
   - Add: `REACT_APP_API_URL=https://your-backend-url.com`

5. **Deploy**
   - Vercel will deploy your frontend
   - Your site will be available at: `https://your-project-name.vercel.app`

## 🔗 Connect Frontend to Backend

After deploying both services, update the frontend configuration:

1. **Edit `frontend/views/config.js`**
   ```javascript
   API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
     ? 'http://localhost:5000' 
     : 'https://your-backend-url.com', // Update this with your actual backend URL
   ```

2. **Commit and push changes**
   ```bash
   git add .
   git commit -m "Update API URL for production"
   git push origin main
   ```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
   - Sign up for free account

2. **Create Cluster**
   - Choose "Free" tier
   - Select your preferred region
   - Click "Create Cluster"

3. **Set Up Database Access**
   - Go to "Database Access"
   - Create a new database user
   - Set username and password

4. **Set Up Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0)

5. **Get Connection String**
   - Go to "Clusters" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

6. **Update Environment Variables**
   - Use the connection string as your `MONGO_URI`

## 🔒 Security Considerations

### Environment Variables
- ✅ Never commit `.env` files to Git
- ✅ Use strong JWT secrets
- ✅ Use production MongoDB URI
- ✅ Enable HTTPS on all services

### CORS Configuration
Update your backend CORS settings for production:

```javascript
// In app.js
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:3000'],
  credentials: true
}));
```

### File Upload Security
- ✅ Validate file types
- ✅ Limit file sizes
- ✅ Use secure file storage (consider cloud storage for production)

## 📊 Monitoring & Maintenance

### Health Checks
- Backend health check: `GET /` should return "API is running..."
- Monitor application logs
- Set up error tracking (Sentry, etc.)

### Performance Optimization
- Enable compression
- Use CDN for static assets
- Optimize database queries
- Implement caching strategies

## 🚀 Post-Deployment Checklist

- [ ] Backend is accessible and responding
- [ ] Frontend loads without errors
- [ ] API calls work from frontend
- [ ] File uploads work correctly
- [ ] Authentication flows work
- [ ] Database connections are stable
- [ ] HTTPS is enabled
- [ ] Environment variables are set correctly
- [ ] Error handling is working
- [ ] Performance is acceptable

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS configuration in backend
   - Ensure frontend domain is allowed

2. **Database Connection Issues**
   - Verify MongoDB URI format
   - Check network access settings
   - Ensure database user has correct permissions

3. **File Upload Issues**
   - Check file size limits
   - Verify upload directory permissions
   - Ensure proper file type validation

4. **Authentication Issues**
   - Verify JWT secret is set correctly
   - Check token expiration settings
   - Ensure proper token storage

### Debug Commands

```bash
# Check backend logs
railway logs
# or
render logs

# Check frontend deployment
netlify status
# or
vercel logs
```

## 📞 Support

If you encounter issues during deployment:

1. Check the service-specific documentation
2. Review application logs
3. Verify environment variables
4. Test locally with production settings
5. Contact the development team

---

**Happy Deploying! 🎉**

Your Find-A-Hand application will be live and ready to connect handymen with customers worldwide! 