const express = require('express');
const { createBooking,getBooking,cancelBooking,getBookingById } = require('../controllers/bookingController');
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/', protect, getBooking);
router.get('/:id', protect, getBookingById); 
router.post('/:id/cancel', protect, cancelBooking);


module.exports = router;
