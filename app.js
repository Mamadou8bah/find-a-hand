const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./backend/routes/userRoutes');
const bookingRoutes = require('./backend/routes/bookingRoutes');
const customerRoutes = require('./backend/routes/customerRoutes');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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
      'https://findahand.netlify.app',
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

// Serve static files from uploads directory with error handling
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
// Health check endpoint
app.get('/health', (req, res) => {
  const uploadsDir = path.join(__dirname, 'uploads', 'profileImages');
  const uploadsExists = fs.existsSync(uploadsDir);
  
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uploadsDirectory: {
      exists: uploadsExists,
      path: uploadsDir,
      writable: uploadsExists ? fs.accessSync(uploadsDir, fs.constants.W_OK) : false
    },
    version: '1.0.0'
  });
});

// Test endpoint that simulates handyman login

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      message: 'File too large. Maximum size is 5MB.' 
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ 
      message: 'Unexpected file field.' 
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors 
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      message: 'Invalid token' 
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      message: 'Token expired' 
    });
  }
  
  // Default error
  res.status(500).json({ 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl 
  });
});

module.exports = app;
