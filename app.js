const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./backend/routes/userRoutes');
const bookingRoutes = require('./backend/routes/bookingRoutes');
const customerRoutes = require('./backend/routes/customerRoutes');
const cors = require('cors');
dotenv.config();
const app = express();

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all localhost origins for development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    
    // Allow all Netlify domains
    if (origin.includes('netlify.app')) {
      return callback(null, true);
    }
    
    // Allow all Vercel domains
    if (origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    // Allow specific production domains
    const allowedDomains = [
      'https://find-a-hand.netlify.app',
      'https://find-a-hand.vercel.app',
      'https://golden-gaufre-857914.netlify.app'
    ];
    
    // Add domains from environment variable
    if (process.env.CORS_ORIGIN) {
      const envDomains = process.env.CORS_ORIGIN.split(',').map(domain => domain.trim());
      allowedDomains.push(...envDomains);
    }
    
    if (allowedDomains.includes(origin)) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    console.log('Allowed domains:', allowedDomains);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json()); 
app.use('/uploads', express.static('uploads'));

// Serve static files from frontend directory
app.use(express.static('frontend'));

app.use('/api/handymen', require('./backend/routes/handymanRoutes'));

app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/customers', customerRoutes);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/frontend/views/index.html');
});

// Serve other HTML pages
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/frontend/views/login.html');
});

app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/frontend/views/signup.html');
});

app.get('/login-selection', (req, res) => {
  res.sendFile(__dirname + '/frontend/views/login-selection.html');
});

app.get('/login-handyman', (req, res) => {
  res.sendFile(__dirname + '/frontend/views/login-handyman.html');
});

app.get('/joinHandy', (req, res) => {
  res.sendFile(__dirname + '/frontend/views/joinHandy.html');
});

app.get('/search-handyman', (req, res) => {
  res.sendFile(__dirname + '/frontend/views/search-handyman.html');
});

app.get('/handyman-profile', (req, res) => {
  res.sendFile(__dirname + '/frontend/views/handyman-profile.html');
});

app.get('/booking', (req, res) => {
  res.sendFile(__dirname + '/frontend/views/booking.html');
});

app.get('/customer-dashboard', (req, res) => {
  res.sendFile(__dirname + '/frontend/views/customer-dashboard.html');
});

app.get('/handyman-dashboard', (req, res) => {
  res.sendFile(__dirname + '/frontend/views/handyman-dashboard.html');
});

app.get('/my-handyman-profile', (req, res) => {
  res.sendFile(__dirname + '/frontend/views/my-handyman-profile.html');
});

app.get('/view-handymen', (req, res) => {
  res.sendFile(__dirname + '/frontend/views/view-handymen.html');
});

app.get('/all-home-projects', (req, res) => {
  res.sendFile(__dirname + '/frontend/views/all-home-projects.html');
});

app.get('/debug', (req, res) => {
  res.sendFile(__dirname + '/frontend/views/debug.html');
});

// Test endpoint for deployment verification
app.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Find-A-Hand API is working!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// CORS test endpoint
app.get('/cors-test', (req, res) => {
  res.status(200).json({
    message: 'CORS is working correctly!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'connected' // We'll handle DB status separately
  };
  
  res.status(200).json(healthCheck);
});

module.exports = app;
