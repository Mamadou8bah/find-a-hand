
const express = require('express');
const router = express.Router();
const handymanController = require('../controllers/handymanController');
const auth = require('../middlewares/handymanAuthMiddleware');
const { check } = require('express-validator');
const upload = require('../middlewares/uploadMiddleware'); 

// @route   POST api/handymen/register
// @desc    Register a handyman
// @access  Public
router.post(
  '/register', upload.single('profileImage'),
  [
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phone', 'Phone number must be at least 7 digits').isLength({ min: 7 }),
    check('location', 'Location is required').not().isEmpty(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('profession', 'Profession is required').not().isEmpty()
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

// @route   GET api/handymen/me
// @desc    Get current handyman's profile
// @access  Private
router.get('/me', auth, handymanController.getProfile);

// @route   PUT api/handymen/me
// @desc    Update handyman profile
// @access  Private
router.put('/me', auth, handymanController.updateProfile);

// @route   GET api/handymen
// @desc    Get all handymen
// @access  Public
router.get('/', handymanController.getAllHandymen);

// @route   GET api/handymen/:id
// @desc    Get handyman by ID
// @access  Public
router.get('/:id', handymanController.getHandymanById);

// @route   POST api/handymen/:id/reviews
// @desc    Add review to handyman
// @access  Private
router.post(
  '/:id/reviews',
  [
    auth,
    check('rating', 'Rating is required and must be between 1 and 5').isInt({ min: 1, max: 5 }),
    check('comment', 'Comment is required').not().isEmpty()
  ],
  handymanController.addReview
);

module.exports = router;
