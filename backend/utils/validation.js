const { check, validationResult } = require('express-validator');

// Common validation rules
const commonValidations = {
  email: check('email', 'Please include a valid email')
    .isEmail()
    .normalizeEmail(),
  
  password: check('password', 'Password must be at least 6 characters')
    .isLength({ min: 6 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  firstName: check('firstName', 'First name is required')
    .not()
    .isEmpty()
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  
  lastName: check('lastName', 'Last name is required')
    .not()
    .isEmpty()
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  
  phone: check('phone', 'Please enter a valid phone number')
    .isLength({ min: 7, max: 15 })
    .matches(/^[0-9+\-\s()]+$/, 'Phone number can only contain numbers, spaces, hyphens, and parentheses'),
  
  location: check('location', 'Location is required')
    .not()
    .isEmpty()
    .trim()
    .isLength({ min: 3, max: 100 }),
  
  profession: check('profession', 'Profession is required')
    .not()
    .isEmpty()
    .trim()
    .isLength({ min: 2, max: 50 }),
  
  skills: check('skills', 'At least one skill is required')
    .not()
    .isEmpty(),
  
  experience: check('experience', 'Experience must be a positive number')
    .isInt({ min: 0, max: 50 }),
  
  hourlyRate: check('hourlyRate', 'Hourly rate must be a positive number')
    .isFloat({ min: 0, max: 1000 }),
  
  service: check('service', 'Service is required')
    .not()
    .isEmpty()
    .trim()
    .isLength({ min: 2, max: 100 }),
  
  taskDescription: check('taskDescription', 'Task description is required')
    .not()
    .isEmpty()
    .trim()
    .isLength({ min: 10, max: 500 }),
  
  date: check('date', 'Date is required and must be in the future')
    .isISO8601()
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date <= now) {
        throw new Error('Booking date must be in the future');
      }
      return true;
    }),
  
  time: check('time', 'Time is required in HH:MM format')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use a valid time format (HH:MM)'),
  
  rating: check('rating', 'Rating must be between 1 and 5')
    .isInt({ min: 1, max: 5 }),
  
  comment: check('comment', 'Review comment is required')
    .not()
    .isEmpty()
    .trim()
    .isLength({ min: 10, max: 500 })
};

// Validation chains for different operations
const validationChains = {
  // Handyman registration
  handymanRegistration: [
    commonValidations.firstName,
    commonValidations.lastName,
    commonValidations.email,
    commonValidations.phone,
    commonValidations.location,
    commonValidations.password,
    commonValidations.profession,
    commonValidations.skills,
    commonValidations.experience,
    commonValidations.hourlyRate
  ],
  
  // Handyman login
  handymanLogin: [
    commonValidations.email,
    check('password', 'Password is required').exists()
  ],
  
  // User registration
  userRegistration: [
    commonValidations.firstName,
    commonValidations.lastName,
    commonValidations.email,
    commonValidations.phone,
    commonValidations.location,
    commonValidations.password
  ],
  
  // User login
  userLogin: [
    commonValidations.email,
    check('password', 'Password is required').exists()
  ],
  
  // Booking creation
  bookingCreation: [
    check('handymanId', 'Handyman ID is required').isMongoId(),
    commonValidations.service,
    commonValidations.taskDescription,
    commonValidations.date,
    commonValidations.time,
    commonValidations.phone,
    commonValidations.location,
    check('estimatedDuration', 'Estimated duration must be between 1 and 24 hours')
      .optional()
      .isInt({ min: 1, max: 24 }),
    check('estimatedCost', 'Estimated cost must be a positive number')
      .optional()
      .isFloat({ min: 0 })
  ],
  
  // Review creation
  reviewCreation: [
    check('handymanId', 'Handyman ID is required').isMongoId(),
    commonValidations.rating,
    commonValidations.comment
  ],
  
  // Profile update
  profileUpdate: [
    commonValidations.firstName.optional(),
    commonValidations.lastName.optional(),
    commonValidations.phone.optional(),
    commonValidations.location.optional(),
    commonValidations.profession.optional(),
    commonValidations.skills.optional(),
    commonValidations.experience.optional(),
    commonValidations.hourlyRate.optional()
  ],
  
  // Password update
  passwordUpdate: [
    check('currentPassword', 'Current password is required').exists(),
    commonValidations.password
  ]
};

// Custom validation functions
const customValidations = {
  // Check if email already exists
  async checkEmailExists(email, model, excludeId = null) {
    const query = { email: email.toLowerCase() };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const exists = await model.findOne(query);
    if (exists) {
      throw new Error('Email already exists');
    }
    return true;
  },
  
  // Check if handyman exists
  async checkHandymanExists(handymanId) {
    const Handyman = require('../models/HandymanModel');
    const handyman = await Handyman.findById(handymanId);
    if (!handyman) {
      throw new Error('Handyman not found');
    }
    return true;
  },
  
  // Check if user exists
  async checkUserExists(userId) {
    const User = require('../models/userModel');
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return true;
  },
  
  // Check if booking exists
  async checkBookingExists(bookingId) {
    const Booking = require('../models/bookingModel');
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }
    return true;
  },
  
  // Validate file upload
  validateFileUpload(file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], maxSize = 5 * 1024 * 1024) {
    if (!file) {
      throw new Error('File is required');
    }
    
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
    }
    
    return true;
  }
};

// Handle validation results
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

module.exports = {
  commonValidations,
  validationChains,
  customValidations,
  handleValidation,
  validationResult
}; 