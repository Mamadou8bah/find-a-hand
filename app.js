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
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      // Add your production frontend URLs here
      'https://find-a-hand.netlify.app',
      'https://find-a-hand.vercel.app',
      'https://your-frontend-domain.com' // Replace with your actual frontend domain
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(express.json()); 
app.use('/uploads', express.static('uploads'));
app.use('/api/handymen', require('./backend/routes/handymanRoutes'));

app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/customers', customerRoutes);

app.get('/', (req, res) => {
  res.send('Find-A-Hand API is running...');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = app;
