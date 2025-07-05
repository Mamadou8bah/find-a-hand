const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const handymanSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please use a valid email address'],
    index: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    minlength: [7, 'Phone number must be at least 7 digits'],
    maxlength: [15, 'Phone number cannot exceed 15 digits'],
    match: [/^[0-9+\-\s()]+$/, 'Please use a valid phone number format']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    minlength: [3, 'Location must be at least 3 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  profession: {
    type: String,
    required: [true, 'Profession is required'],
    trim: true,
    minlength: [2, 'Profession must be at least 2 characters']
  },
  skills: {
    type: [String],
    required: [true, 'At least one skill is required'],
    validate: {
      validator: function(v) {
        return v.length > 0 && v.length <= 20;
      },
      message: 'Skills must have between 1 and 20 items'
    }
  },
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience cannot exceed 50 years']
  },
  hourlyRate: {
    type: Number,
    min: [0, 'Hourly rate cannot be negative'],
    max: [1000, 'Hourly rate cannot exceed 1000']
  },
  profileImage: {
    type: String,
    required: false
  },
  portfolioImages: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.length <= 10;
      },
      message: 'Cannot upload more than 10 portfolio images'
    }
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      minlength: [10, 'Review comment must be at least 10 characters'],
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  availability: {
    type: Map,
    of: String
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  pendingRequests: {
    type: Number,
    default: 0,
    min: 0
  },
  monthlyEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  confirmedBookings: {
    type: Number,
    default: 0,
    min: 0
  },
  completedBookings: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }]
}, {
  timestamps: true
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

// Create indexes for better performance
handymanSchema.index({ email: 1 });
handymanSchema.index({ location: 1 });
handymanSchema.index({ profession: 1 });
handymanSchema.index({ skills: 1 });
handymanSchema.index({ rating: -1 });
handymanSchema.index({ isAvailable: 1 });
handymanSchema.index({ createdAt: -1 });

const Handyman = mongoose.model('Handyman', handymanSchema);

module.exports = Handyman;