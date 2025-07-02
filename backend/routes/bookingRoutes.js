const express = require('express');
const { createBooking,getBooking,cancelBooking } = require('../controllers/bookingController');
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/', protect, getBooking);
router.post('/:id/cancel', protect, cancelBooking);


module.exports = router;
