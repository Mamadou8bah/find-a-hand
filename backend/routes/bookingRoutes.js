const express = require('express');
const {
  createBooking,
  getBooking,
  cancelBooking,
  getBookingById
} = require('../controllers/bookingController');
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

// 🔒 Authenticated user creates a booking
router.post('/', protect, createBooking);

// 🔒 Get all bookings for current user
router.get('/', protect, getBooking);

// 🔒 Get one by ID
router.get('/:id', protect, getBookingById);

// 🔒 Cancel booking
router.post('/:id/cancel', protect, cancelBooking);

module.exports = router;
