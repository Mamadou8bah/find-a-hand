const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./backend/routes/userRoutes');
const bookingRoutes = require('./backend/routes/bookingRoutes');
const customerRoutes = require('./backend/routes/customerRoutes');
const cors=require('cors')
dotenv.config();
const app = express();
app.use(cors())
app.use(express.json()); 
app.use('/uploads', express.static('uploads'));
app.use('/api/handymen', require('./backend/routes/handymanRoutes'));

app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/customers', customerRoutes);

app.get('/', (req, res) => {
  res.send(' API is running...');
});

module.exports = app;
