const Handyman = require('../models/HandymanModel');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Booking = require('../models/bookingModel');

// Register a new handyman
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, phone, location, password, profession } = req.body;

  try {
    // Check if user already exists
    let handyman = await Handyman.findOne({ email });
    if (handyman) {
      return res.status(400).json({ message: 'Handyman already exists' });
    }

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
      profileImage: req.file.path 
    });

    await handyman.save();

    // Create JWT token
    const payload = {
      handyman: {
        id: handyman.id,
        role: 'handyman'
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
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

    // Create JWT token
    const payload = {
      handyman: {
        id: handyman.id,
        role: 'handyman'
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get handyman profile
exports.getProfile = async (req, res) => {
  try {
    const handyman = await Handyman.findById(req.handyman.id).select('-password');
    res.json(handyman);
  } catch (err) {
    console.error(err.message);
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
  const { status } = req.body;

  if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      handymanId: req.handyman.id
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status;
    await booking.save();

    res.json({ message: `Booking marked as ${status}`, booking });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


// Get all handymen
exports.getAllHandymen = async (req, res) => {
  try {
    const handymen = await Handyman.find().select('-password');
    res.json(handymen);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get handyman by ID
exports.getHandymanById = async (req, res) => {
  try {
    const handyman = await Handyman.findById(req.params.id).select('-password');
    
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
  const { rating, comment } = req.body;

  try {
    const handyman = await Handyman.findById(req.params.id);

    if (!handyman) {
      return res.status(404).json({ message: 'Handyman not found' });
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

    res.json(handyman.reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ handymanId: req.handyman.id })
      .populate('userId', 'firstName lastName phone') // Show who booked
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
