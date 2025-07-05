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

// Database test endpoint
app.get('/db-test', async (req, res) => {
  try {
    const Handyman = require('./backend/models/HandymanModel');
    const count = await Handyman.countDocuments();
    res.status(200).json({
      message: 'Database connection successful!',
      handymanCount: count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      message: 'Database connection failed!',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Environment check endpoint
app.get('/env-check', (req, res) => {
  const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'NODE_ENV'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  res.status(200).json({
    message: 'Environment check',
    nodeEnv: process.env.NODE_ENV,
    mongoUri: process.env.MONGO_URI ? 'Set' : 'Missing',
    jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Missing',
    missingVariables: missingVars,
    timestamp: new Date().toISOString()
  });
});

// Handyman login test endpoint
app.get('/handyman-login-test', async (req, res) => {
  try {
    const Handyman = require('./backend/models/HandymanModel');
    const jwt = require('jsonwebtoken');
    
    // Check if we can find any handymen
    const handymenCount = await Handyman.countDocuments();
    
    // Check if JWT_SECRET is available
    const jwtSecret = process.env.JWT_SECRET;
    
    res.status(200).json({
      message: 'Handyman login test',
      handymenCount: handymenCount,
      jwtSecretAvailable: !!jwtSecret,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      message: 'Handyman login test failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Comprehensive login test endpoint
app.get('/login-test', async (req, res) => {
  try {
    console.log('=== Login Test Endpoint Called ===');
    
    // Test 1: Environment Variables
    const envTest = {
      NODE_ENV: process.env.NODE_ENV,
      MONGO_URI: process.env.MONGO_URI ? 'Set' : 'Missing',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing'
    };
    
    // Test 2: Database Connection
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    // Test 3: Handyman Model
    const Handyman = require('./backend/models/HandymanModel');
    const handymenCount = await Handyman.countDocuments();
    
    // Test 4: JWT Functionality
    let jwtTest = 'Failed';
    try {
      const jwt = require('jsonwebtoken');
      const testPayload = { test: 'data' };
      const testToken = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
      jwt.verify(testToken, process.env.JWT_SECRET);
      jwtTest = 'Success';
    } catch (jwtError) {
      jwtTest = `Failed: ${jwtError.message}`;
    }
    
    // Test 5: Bcrypt Functionality
    let bcryptTest = 'Failed';
    try {
      const bcrypt = require('bcryptjs');
      const testPassword = 'testpassword123';
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      const isMatch = await bcrypt.compare(testPassword, hashedPassword);
      bcryptTest = isMatch ? 'Success' : 'Failed: Password comparison failed';
    } catch (bcryptError) {
      bcryptTest = `Failed: ${bcryptError.message}`;
    }
    
    // Test 6: Express Validator
    let validatorTest = 'Failed';
    try {
      const { check, validationResult } = require('express-validator');
      const testValidation = [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
      ];
      validatorTest = 'Success';
    } catch (validatorError) {
      validatorTest = `Failed: ${validatorError.message}`;
    }
    
    res.status(200).json({
      message: 'Comprehensive login test',
      environment: envTest,
      database: {
        state: dbStates[dbState],
        handymenCount: handymenCount
      },
      jwt: jwtTest,
      bcrypt: bcryptTest,
      validator: validatorTest,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Login test error:', error);
    res.status(500).json({
      message: 'Login test failed',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
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

// Test endpoint that simulates handyman login
app.post('/test-handyman-login', async (req, res) => {
  try {
    console.log('=== Test Handyman Login ===');
    console.log('Request body:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required',
        received: { email: !!email, password: !!password }
      });
    }
    
    // Test 1: Find handyman
    const Handyman = require('./backend/models/HandymanModel');
    const handyman = await Handyman.findOne({ email });
    
    if (!handyman) {
      console.log('Handyman not found for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    console.log('Handyman found:', handyman._id);
    
    // Test 2: Compare password
    const isMatch = await handyman.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for handyman:', handyman._id);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    console.log('Password verified successfully');
    
    // Test 3: Create JWT token
    const jwt = require('jsonwebtoken');
    const payload = {
      handyman: {
        id: handyman.id,
        role: 'handyman'
      }
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('JWT token created successfully');
    
    res.json({ 
      token, 
      message: 'Login successful',
      handyman: {
        id: handyman._id,
        email: handyman.email,
        firstName: handyman.firstName,
        lastName: handyman.lastName
      }
    });
    
  } catch (error) {
    console.error('Test login error:', error);
    res.status(500).json({
      message: 'Test login failed',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = app;
