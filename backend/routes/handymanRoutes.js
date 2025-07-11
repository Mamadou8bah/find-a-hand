const express = require('express');
const router = express.Router();
const handymanController = require('../controllers/handymanController');
const auth = require('../middlewares/handymanAuthMiddleware');
const customerAuth = require('../middlewares/authMiddleware');
const { check } = require('express-validator');
const upload = require('../middlewares/uploadMiddleware'); 
const Handyman = require('../models/HandymanModel');

// @route   POST api/handymen/register
// @desc    Register a handyman
// @access  Public
router.post(
  '/register', upload.single('profileImage'),
  [
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phone', 'Phone number must be at least 7 digits').isLength({ min: 7 }).custom((value) => {
      // Remove all non-digit characters and check length
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length < 7) {
        throw new Error('Phone number must contain at least 7 digits');
      }
      return true;
    }),
    check('location', 'Location is required').not().isEmpty(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('profession', 'Profession is required').not().isEmpty(),
    check('skills', 'Skills are required').not().isEmpty(),
    check('experience', 'Experience is required').custom((value) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 0) {
        throw new Error('Experience must be a valid number (0 or greater)');
      }
      return true;
    })
  ],
  handymanController.register
);

// @route   POST api/handymen/login
// @desc    Login handyman
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  handymanController.login
);

// @route   GET api/handymen
// @desc    Get all handymen
// @access  Public
router.get('/', handymanController.getAllHandymen);

// @route   GET api/handymen/me
// @desc    Get current handyman's profile
// @access  Private
router.get('/me', auth, handymanController.getProfile);

// @route   PUT api/handymen/me
// @desc    Update handyman profile
// @access  Private
router.put('/me', auth, upload.single('profileImage'), handymanController.updateProfile);

// @route   PUT api/handymen/me/password
// @desc    Update handyman password
// @access  Private
router.put('/me/password', auth, [
  check('currentPassword', 'Current password is required').exists(),
  check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
], handymanController.updatePassword);

// @route   GET api/handymen/me/bookings
// @desc    Get current handyman's bookings
// @access  Private
router.get('/me/bookings', auth, handymanController.getMyBookings);

// @route   PUT api/handymen/me/bookings/:id/status
// @desc    Update booking status
// @access  Private
router.put('/me/bookings/:id/status', auth, handymanController.updateBookingStatus);

// @route   DELETE api/handymen/me/bookings/:id
// @desc    Delete booking
// @access  Private
router.delete('/me/bookings/:id', auth, handymanController.deleteBooking);

// @route   POST api/handymen/me/test-booking
// @desc    Create a test booking for debugging
// @access  Private
router.post('/me/test-booking', auth, handymanController.createTestBooking);

// @route   GET api/handymen/:id
// @desc    Get handyman by ID
// @access  Public
router.get('/:id', handymanController.getHandymanById);

// @route   POST api/handymen/reviews
// @desc    Add review to handyman (customer only)
// @access  Private
router.post(
  '/reviews',
  [
    customerAuth, // Use customer authentication middleware
    check('rating', 'Rating is required and must be between 1 and 5').isInt({ min: 1, max: 5 }),
    check('comment', 'Comment is required').not().isEmpty(),
    check('handymanId', 'Handyman ID is required').not().isEmpty()
  ],
  handymanController.addReview
);

// DELETE all handymen profiles (admin/dev use only)
router.delete('/delete-all', async (req, res) => {
  try {
    await Handyman.deleteMany({});
    res.json({ message: 'All handymen deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a handyman by ID (admin/dev use only)
router.delete('/:id', async (req, res) => {
  try {
    const result = await Handyman.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Handyman not found' });
    }
    res.json({ message: 'Handyman deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
