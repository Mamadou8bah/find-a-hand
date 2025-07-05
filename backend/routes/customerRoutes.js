const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middlewares/authMiddleware'); // Customer auth
const handymanController = require('../controllers/handymanController');

// @route   POST api/customers/reviews
// @desc    Add review to handyman (customer only)
// @access  Private
router.post(
  '/reviews',
  [
    auth,
    check('rating', 'Rating is required and must be between 1 and 5').isInt({ min: 1, max: 5 }),
    check('comment', 'Comment is required').not().isEmpty(),
    check('handymanId', 'Handyman ID is required').not().isEmpty()
  ],
  (req, res, next) => {
    console.log('=== Customer review route hit ===');
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);
    console.log('User ID:', req.user?.id);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }
    
    next();
  },
  handymanController.addReview
);

// @route   GET api/customers/reviews/:handymanId
// @desc    Get reviews for a specific handyman
// @access  Public
router.get('/reviews/:handymanId', async (req, res) => {
  try {
    const Handyman = require('../models/HandymanModel');
    const handyman = await Handyman.findById(req.params.handymanId)
      .select('reviews rating')
      .populate('reviews.userId', 'firstName lastName');

    if (!handyman) {
      return res.status(404).json({ message: 'Handyman not found' });
    }

    res.json({
      reviews: handyman.reviews,
      averageRating: handyman.rating,
      totalReviews: handyman.reviews.length
    });
  } catch (err) {
    console.error('Error fetching reviews:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 