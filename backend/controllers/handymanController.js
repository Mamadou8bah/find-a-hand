const Handyman = require('../models/HandymanModel');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Booking = require('../models/bookingModel');
const mongoose = require('mongoose');

// Register a new handyman
exports.register = async (req, res) => {
  console.log('=== Handyman Registration ===');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  console.log('Request headers:', req.headers);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, phone, location, password, profession } = req.body;

  try {
    // Check if user already exists
    let handyman = await Handyman.findOne({ email });
    if (handyman) {
      console.log('Handyman already exists:', email);
      return res.status(400).json({ message: 'Handyman already exists' });
    }

    console.log('Creating new handyman...');
    
    // Create new handyman
    handyman = new Handyman({
      firstName,
      lastName,
      email,
      phone,
      location,
      password,
      profession,
      skills: Array.isArray(req.body.skills) ? req.body.skills : req.body.skills.split(',').map(skill => skill.trim()),
      experience: req.body.experience || 0,
      hourlyRate: req.body.hourlyRate || 0,
      profileImage: req.file ? req.file.path : undefined
    });

    await handyman.save();
    console.log('Handyman saved successfully:', handyman._id);

    // Create JWT token using async/await
    const payload = {
      handyman: {
        id: handyman.id,
        role: 'handyman'
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    console.log('JWT token created successfully');
    console.log('Handyman registered successfully:', handyman.email);
    console.log('Sending response with token...');
    
    // Set proper headers
    res.setHeader('Content-Type', 'application/json');
    
    res.json({ token, message: 'Registration successful' });
    console.log('Response sent successfully');
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).send('Server error');
  }
};

// Login handyman
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if handyman exists
    let handyman = await Handyman.findOne({ email });
    if (!handyman) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await handyman.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token using async/await
    const payload = {
      handyman: {
        id: handyman.id,
        role: 'handyman'
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    console.log('Handyman logged in successfully:', handyman.email);
    res.json({ token, message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server error');
  }
};

// Get handyman profile
exports.getProfile = async (req, res) => {
  try {
    console.log('=== getProfile called ===');
    console.log('Request handyman:', req.handyman);
    console.log('Handyman ID:', req.handyman?.id);
    
    if (!req.handyman || !req.handyman.id) {
      console.log('No handyman data in request');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const handyman = await Handyman.findById(req.handyman.id).select('-password');
    
    if (!handyman) {
      console.log('Handyman not found for ID:', req.handyman.id);
      return res.status(404).json({ message: 'Handyman not found' });
    }
    
    console.log('Handyman found:', handyman._id);
    
    // Populate user data for reviews if reviews exist
    if (handyman.reviews && handyman.reviews.length > 0) {
      const User = require('../models/userModel');
      const userIds = handyman.reviews.map(review => review.userId);
      const users = await User.find({ _id: { $in: userIds } }).select('firstName lastName');
      
      // Create a map of user data
      const userMap = {};
      users.forEach(user => {
        userMap[user._id.toString()] = user;
      });
      
      // Add user data to reviews
      handyman.reviews = handyman.reviews.map(review => ({
        ...review.toObject(),
        user: userMap[review.userId.toString()]
      }));
    }
    
    res.json(handyman);
  } catch (err) {
    console.error('getProfile error:', err.message);
    res.status(500).send('Server error');
  }
};

// Update handyman profile
exports.updateProfile = async (req, res) => {
  const { firstName, lastName, phone, location, profession, skills, experience, hourlyRate } = req.body;

  const profileFields = {
    firstName,
    lastName,
    phone,
    location,
    profession,
    experience,
    hourlyRate
  };

  if (skills) {
    profileFields.skills = Array.isArray(skills)
      ? skills
      : skills.split(',').map(skill => skill.trim());
  }

  if (req.file) {
    profileFields.profileImage = req.file.path;
  }

  // Remove undefined keys (to avoid overwriting fields with undefined)
  Object.keys(profileFields).forEach(
    key => profileFields[key] === undefined && delete profileFields[key]
  );

  try {
    let handyman = await Handyman.findById(req.handyman.id);

    if (!handyman) {
      return res.status(404).json({ message: 'Handyman not found' });
    }

    handyman = await Handyman.findByIdAndUpdate(
      req.handyman.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    res.json(handyman);
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).send('Server error');
  }
};

exports.updateBookingStatus = async (req, res) => {
  console.log('=== updateBookingStatus called ===');
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);
  console.log('Handyman ID:', req.handyman.id);

  const { status } = req.body;

  // Map lowercase status to proper case
  const statusMap = {
    'confirmed': 'Confirmed',
    'cancelled': 'Cancelled', 
    'completed': 'Completed'
  };

  const mappedStatus = statusMap[status];
  if (!mappedStatus) {
    console.log('Invalid status received:', status);
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    console.log('Updating booking status:', {
      bookingId: req.params.id,
      handymanId: req.handyman.id,
      status: mappedStatus
    });

    // Validate ObjectId format
    if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ObjectId format:', req.params.id);
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      handymanId: req.handyman.id
    });

    if (!booking) {
      console.log('Booking not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log('Found booking:', booking._id, 'Current status:', booking.status);
    
    booking.status = mappedStatus;
    await booking.save();

    console.log('Booking status updated successfully to:', booking.status);

    res.json({ message: `Booking marked as ${mappedStatus}`, booking });
  } catch (err) {
    console.error('Error updating booking status:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Get all handymen
exports.getAllHandymen = async (req, res) => {
  try {
    console.log('=== getAllHandymen called ===');
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    
    const handymen = await Handyman.find().select('-password');
    console.log('Found handymen:', handymen.length);
    
    // Add review count to each handyman
    const handymenWithReviewCount = handymen.map(handyman => {
      const handymanObj = handyman.toObject();
      handymanObj.ratingCount = handyman.reviews ? handyman.reviews.length : 0;
      return handymanObj;
    });
    
    console.log('Returning handymen with review counts');
    res.json(handymenWithReviewCount);
  } catch (err) {
    console.error('getAllHandymen error:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Get handyman by ID
exports.getHandymanById = async (req, res) => {
  try {
    const handyman = await Handyman.findById(req.params.id)
      .select('-password')
      .populate('reviews.userId', 'firstName lastName');
    
    if (!handyman) {
      return res.status(404).json({ message: 'Handyman not found' });
    }
    
    res.json(handyman);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Handyman not found' });
    }
    res.status(500).send('Server error');
  }
};

// Add review to handyman
exports.addReview = async (req, res) => {
  const { rating, comment, handymanId } = req.body;

  try {
    console.log('=== addReview called ===');
    console.log('Request user:', req.user);
    console.log('User ID:', req.user?.id);
    
    if (!req.user || !req.user.id) {
      console.log('No user data in request');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const handyman = await Handyman.findById(handymanId);

    if (!handyman) {
      return res.status(404).json({ message: 'Handyman not found' });
    }

    // Check if user has already reviewed this handyman
    const existingReview = handyman.reviews.find(
      review => review.userId.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this handyman',
        existingReview 
      });
    }

    // Optional: Check if user has booked this handyman (for validation)
    const Booking = require('../models/bookingModel');
    const hasBooked = await Booking.findOne({
      user: req.user.id,
      handymanId: handymanId,
      status: { $in: ['confirmed', 'completed'] }
    });

    if (!hasBooked) {
      console.log('User has not booked this handyman, but allowing review anyway');
    }

    const newReview = {
      userId: req.user.id,
      rating,
      comment,
      createdAt: new Date()
    };

    handyman.reviews.unshift(newReview);

    // Calculate new average rating
    const totalRatings = handyman.reviews.reduce((sum, review) => sum + review.rating, 0);
    handyman.rating = totalRatings / handyman.reviews.length;

    await handyman.save();

    // Populate user data for the new review
    const User = require('../models/userModel');
    const user = await User.findById(req.user.id).select('firstName lastName');
    
    const reviewWithUser = {
      ...newReview,
      user: user
    };

    res.json({ 
      message: 'Review added successfully',
      review: reviewWithUser,
      newAverageRating: handyman.rating,
      totalReviews: handyman.reviews.length
    });
  } catch (err) {
    console.error('addReview error:', err.message);
    res.status(500).send('Server error');
  }
};


exports.getMyBookings = async (req, res) => {
  try {
    console.log('=== getMyBookings called ===');
    console.log('Request handyman:', req.handyman);
    console.log('Handyman ID:', req.handyman?.id);
    
    if (!req.handyman || !req.handyman.id) {
      console.log('No handyman data in request');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const bookings = await Booking.find({ handymanId: req.handyman.id })
      .populate('user', 'firstName lastName phone') // Show who booked
      .sort({ createdAt: -1 });

    console.log('Found bookings:', bookings.length);
    res.json(bookings);
  } catch (err) {
    console.error('getMyBookings error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    console.log('=== deleteBooking called ===');
    console.log('Request params:', req.params);
    console.log('Handyman ID:', req.handyman.id);

    // Validate ObjectId format
    if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ObjectId format:', req.params.id);
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      handymanId: req.handyman.id
    });

    if (!booking) {
      console.log('Booking not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log('Found booking:', booking._id, 'Current status:', booking.status);
    
    await Booking.findByIdAndDelete(req.params.id);

    console.log('Booking deleted successfully');

    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Error deleting booking:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update handyman password
exports.updatePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const handyman = await Handyman.findById(req.handyman.id);
    if (!handyman) {
      return res.status(404).json({ message: 'Handyman not found' });
    }

    // Check current password
    const isMatch = await handyman.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    handyman.password = newPassword;
    await handyman.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err.message);
    res.status(500).send('Server error');
  }
};

// Create a test booking for debugging
exports.createTestBooking = async (req, res) => {
  try {
    console.log('Creating test booking for handyman:', req.handyman.id);

    // Create a test booking
    const testBooking = await Booking.create({
      user: req.handyman.id, // Use handyman as user for testing
      handymanId: req.handyman.id,
      service: 'Test Service',
      taskDescription: 'This is a test booking for debugging',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      time: '10:00 AM',
      phone: '1234567890',
      location: 'Test Location',
      status: 'Pending'
    });

    console.log('Test booking created:', testBooking._id);
    res.json({ message: 'Test booking created', booking: testBooking });
  } catch (err) {
    console.error('Error creating test booking:', err.message);
    res.status(500).json({ message: 'Server error creating test booking', error: err.message });
  }
};
