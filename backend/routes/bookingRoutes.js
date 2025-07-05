const express = require('express');
const {
  createBooking,
  getBooking,
  cancelBooking,
  getBookingById,
  getBookingsForCurrentHandyman 
} = require('../controllers/bookingController');
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

// 🔒 Authenticated user creates a booking
router.post('/', protect, createBooking);

// 🔒 Fetch bookings for current handyman
router.get('/me', protect, getBookingsForCurrentHandyman); // 👈 STATIC FIRST

// 🔒 Get all bookings (optional)
router.get('/', protect, getBooking);

// 🔒 Get one by ID (keep last)
router.get('/:id', protect, getBookingById);

// 🔒 Cancel
router.post('/:id/cancel', protect, cancelBooking);

module.exports = router;
