const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'User ID is required'],
    ref: 'User'
  },
  handymanId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Handyman', 
    required: [true, 'Handyman ID is required']
  },
  service: {
    type: String,
    required: [true, 'Service is required'],
    trim: true,
    minlength: [2, 'Service must be at least 2 characters']
  },
  taskDescription: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    minlength: [10, 'Task description must be at least 10 characters'],
    maxlength: [500, 'Task description cannot exceed 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Booking date must be in the future'
    }
  },
  time: {
    type: String, 
    required: [true, 'Time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use a valid time format (HH:MM)']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    minlength: [7, 'Phone number must be at least 7 digits'],
    maxlength: [15, 'Phone number cannot exceed 15 digits']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    minlength: [3, 'Location must be at least 3 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      message: 'Status must be one of: Pending, Confirmed, Completed, Cancelled'
    },
    default: 'Pending'
  },
  estimatedDuration: {
    type: Number,
    min: [1, 'Duration must be at least 1 hour'],
    max: [24, 'Duration cannot exceed 24 hours']
  },
  estimatedCost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  },
  cancellationReason: {
    type: String,
    maxlength: [200, 'Cancellation reason cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Create indexes for better performance
bookingSchema.index({ user: 1 });
bookingSchema.index({ handymanId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ date: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ handymanId: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
