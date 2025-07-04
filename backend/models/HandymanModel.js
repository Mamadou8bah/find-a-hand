const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const handymanSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    minlength: [7, 'Phone number must be at least 7 digits']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  profession: {
    type: String,
    required: [true, 'Profession is required']
  },
  skills: {
    type: [String],
    required: [true, 'At least one skill is required']
  },
  experience: {
    type: Number,
    min: 0
  },
  hourlyRate: {
    type: Number,
    min: 0
  },
profileImage: {
  type: String,
  required: [true, 'Profile image is required']
},

  portfolioImages: [String],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    userId: mongoose.Schema.Types.ObjectId,
    rating: Number,
    comment: String,
    createdAt: Date
  }],
  availability: {
    type: Map,
    of: String
  },
  pendingRequests: {type: Number},
  monthlyEarnings: {
    type: Number}
    ,confirmedBookings: {type: Number},
  createdAt: {
    type: Date,
    default: Date.now
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],

});

// Hash password before saving
handymanSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
handymanSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password when returning user data
handymanSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

const Handyman = mongoose.model('Handyman', handymanSchema);

module.exports = Handyman;